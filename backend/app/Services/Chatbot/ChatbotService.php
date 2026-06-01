<?php

namespace App\Services\Chatbot;

use App\Models\Formation;
use App\Models\Pole;
use Illuminate\Support\Str;

/**
 * Deterministic, rule-based assistant — a server-side port of the frontend
 * engine (src/features/chatbot/engine.ts), backed by live formations data.
 * No LLM. The response shape mirrors the SPA contract so the mock engine can
 * be swapped for these calls directly.
 */
class ChatbotService
{
    private const MENU = [
        ['label' => '📚 Informations formations', 'payload' => 'menu:formations'],
        ['label' => '💶 Tarifs & modalités', 'payload' => 'menu:tarifs'],
        ['label' => "📝 Aide à l'inscription", 'payload' => 'menu:inscription'],
        ['label' => '📅 Planning & disponibilités', 'payload' => 'menu:planning'],
        ['label' => '📄 Documents à fournir', 'payload' => 'menu:documents'],
        ['label' => '📞 Contacter un conseiller', 'payload' => 'menu:contact'],
    ];

    private const MAIN_MENU_REPLY = ['label' => '↩️ Menu principal', 'payload' => 'menu:main'];

    private const GREETING = ['bonjour', 'salut', 'hello', 'bonsoir', 'hi', 'hey'];
    private const FORMATION = ['formation', 'cours', 'programme', 'matiere', 'matière'];
    private const PRICE = ['prix', 'tarif', 'coût', 'cout', 'combien', 'frais', 'paiement', 'payer'];
    private const SCHEDULE = ['horaire', 'planning', 'créneau', 'creneau', 'disponibilité', 'quand'];
    private const DOC = ['document', 'pièce', 'piece', 'papier', 'justificatif'];
    private const CONTACT = ['conseiller', 'contact', 'rappel', 'email', 'téléphone', 'telephone'];

    private const POLE_KEYWORDS = [
        ['keys' => ['math', 'svt', 'physique', 'lycée', 'lycee', 'collège', 'college', 'bac'], 'pole' => 'soutien-scolaire'],
        ['keys' => ['management', 'marketing', 'comptabilité', 'comptabilite', 'professionnel'], 'pole' => 'formation-continue'],
        ['keys' => ['immigration', 'canada', 'allemagne', 'visa', 'étranger', 'etranger', 'dossier', 'expatriation'], 'pole' => 'immigration'],
        ['keys' => ['langue', 'anglais', 'allemand', 'espagnol', 'chinois', 'toeic', 'goethe'], 'pole' => 'langues'],
    ];

    public function respond(string $input): array
    {
        $text = trim($input);
        if ($text === '') {
            return $this->mainMenu();
        }
        $lower = Str::lower($text);

        if (Str::startsWith($text, 'menu:')) {
            return match (Str::after($text, 'menu:')) {
                'main' => $this->mainMenu(),
                'formations' => $this->formationsMenu(),
                'tarifs' => $this->tarifs(null),
                'inscription' => $this->inscription(),
                'planning' => $this->planning(null),
                'documents' => $this->documents(null),
                'contact' => $this->contact(),
                default => $this->fallback(),
            };
        }
        if (Str::startsWith($text, 'pole:')) {
            return $this->poleDetail(Str::after($text, 'pole:'));
        }
        if (Str::startsWith($text, 'tarifs:')) {
            return $this->tarifs(Str::after($text, 'tarifs:'));
        }
        if (Str::startsWith($text, 'planning:')) {
            return $this->planning(Str::after($text, 'planning:'));
        }
        if (Str::startsWith($text, 'documents:')) {
            return $this->documents(Str::after($text, 'documents:'));
        }
        if ($text === 'action:register') {
            return $this->reply("Parfait ! Cliquez sur le bouton « S'inscrire » en haut à droite du site pour créer votre compte en quelques minutes. Vous pourrez ensuite choisir vos formations depuis votre espace.", [self::MAIN_MENU_REPLY]);
        }
        if ($text === 'action:callback') {
            return $this->reply('Très bien. Veuillez écrire votre nom, votre téléphone et le sujet de votre demande, et un conseiller vous rappellera sous 24h ouvrées.', [self::MAIN_MENU_REPLY], ['action' => 'callback']);
        }
        if ($text === 'action:contact-page') {
            return $this->reply('Vous pouvez utiliser le formulaire de contact accessible depuis la page « Contact » du site. Notre équipe vous répond généralement sous 24h.', [self::MAIN_MENU_REPLY]);
        }

        // Free-text intent detection (same order as the frontend engine).
        if ($this->matches($lower, self::GREETING)) {
            return $this->greeting();
        }
        if ($this->matches($lower, self::CONTACT)) {
            return $this->contact();
        }
        if ($this->matches($lower, self::DOC)) {
            return $this->documents($this->detectPole($lower));
        }
        if ($this->matches($lower, self::SCHEDULE)) {
            return $this->planning($this->detectPole($lower));
        }
        if ($this->matches($lower, self::PRICE)) {
            return $this->tarifs($this->detectPole($lower));
        }
        if ($this->matches($lower, self::FORMATION)) {
            $pole = $this->detectPole($lower);

            return $pole ? $this->poleDetail($pole) : $this->formationsMenu();
        }

        $pole = $this->detectPole($lower);
        if ($pole) {
            return $this->poleDetail($pole);
        }

        return $this->fallback();
    }

    // ---- intent responses ----

    private function greeting(): array
    {
        return $this->reply(
            "Bonjour 👋 Je suis l'assistant AFG. Je peux vous aider à choisir une formation, comprendre les tarifs, préparer votre inscription ou contacter un conseiller. Que souhaitez-vous faire ?",
            self::MENU
        );
    }

    private function mainMenu(): array
    {
        return $this->reply('Bien sûr, voici les sujets sur lesquels je peux vous aider :', self::MENU);
    }

    private function fallback(): array
    {
        return $this->reply("Je n'ai pas tout saisi. Voici les sujets sur lesquels je peux vous aider :", self::MENU);
    }

    private function formationsMenu(): array
    {
        $replies = array_map(fn ($p) => ['label' => $p->label, 'payload' => 'pole:'.$p->slug], $this->poles());
        $replies[] = self::MAIN_MENU_REPLY;

        return $this->reply('Pour quel pôle souhaitez-vous des informations ?', $replies);
    }

    private function poleDetail(string $poleSlug): array
    {
        $pole = $this->pole($poleSlug);
        if (! $pole) {
            return $this->formationsMenu();
        }

        $subs = $pole->categories->pluck('label')->implode(', ');
        $text = "Voici notre offre en {$pole->label} :\n\n".$this->listFormations($poleSlug)."\n\nNos sous-catégories : {$subs}.";

        return $this->reply($text, [
            ['label' => 'Tarifs de ce pôle', 'payload' => 'tarifs:'.$poleSlug],
            ['label' => 'Documents à fournir', 'payload' => 'documents:'.$poleSlug],
            ['label' => 'Planning type', 'payload' => 'planning:'.$poleSlug],
            ['label' => "M'inscrire à une formation", 'payload' => 'menu:inscription'],
            self::MAIN_MENU_REPLY,
        ], ['pole' => $poleSlug]);
    }

    private function tarifs(?string $poleSlug): array
    {
        if ($poleSlug && ($pole = $this->pole($poleSlug))) {
            $items = $this->formationsFor($poleSlug)->take(6)
                ->map(fn ($f) => '• '.$f->title.' — '.$this->price($f->price).' ('.$f->duration.')')->implode("\n");
            $text = "Tarifs en {$pole->label} :\n\n{$items}\n\nNous proposons un paiement en plusieurs fois et des réductions familles (10%) ou réinscription (15%).";

            return $this->reply($text, [
                ['label' => "Comment m'inscrire ?", 'payload' => 'menu:inscription'],
                self::MAIN_MENU_REPLY,
            ]);
        }

        $replies = array_map(fn ($p) => ['label' => $p->label, 'payload' => 'tarifs:'.$p->slug], $this->poles());
        $replies[] = self::MAIN_MENU_REPLY;

        return $this->reply(
            "Nos tarifs varient selon les pôles et les formations.\n\n💡 Bon à savoir :\n• Paiement en 3 fois sans frais\n• Réduction famille de 10%\n• Réduction réinscription de 15%\n• Frais d'inscription unique : 300 MAD\n\nSouhaitez-vous le tarif d'un pôle en particulier ?",
            $replies
        );
    }

    private function inscription(): array
    {
        $replies = array_map(fn ($p) => ['label' => $p->label, 'payload' => 'pole:'.$p->slug], $this->poles());
        $replies[] = ['label' => 'Créer mon compte', 'payload' => 'action:register'];
        $replies[] = self::MAIN_MENU_REPLY;

        return $this->reply(
            "L'inscription se fait en 4 étapes simples :\n\n1️⃣ Choisir un pôle\n2️⃣ Sélectionner votre niveau / formation\n3️⃣ Renseigner vos informations personnelles\n4️⃣ Déposer les pièces justificatives\n\nPar quel pôle souhaitez-vous commencer ?",
            $replies,
            ['flow' => 'inscription', 'step' => 1]
        );
    }

    private function planning(?string $poleSlug): array
    {
        if ($poleSlug && ($pole = $this->pole($poleSlug))) {
            $items = $this->formationsFor($poleSlug)->filter(fn ($f) => $f->schedule)->take(5);
            if ($items->isEmpty()) {
                return $this->reply(
                    "Pour {$pole->label}, les créneaux sont définis individuellement avec le conseiller selon votre disponibilité.",
                    [['label' => 'Contacter un conseiller', 'payload' => 'menu:contact'], self::MAIN_MENU_REPLY]
                );
            }
            $list = $items->map(fn ($f) => '• '.$f->title.' — '.$f->schedule)->implode("\n");

            return $this->reply("Plannings types en {$pole->label} :\n\n{$list}", [
                ['label' => 'Tarifs de ce pôle', 'payload' => 'tarifs:'.$poleSlug],
                self::MAIN_MENU_REPLY,
            ]);
        }

        $replies = array_map(fn ($p) => ['label' => $p->label, 'payload' => 'planning:'.$p->slug], $this->poles());
        $replies[] = self::MAIN_MENU_REPLY;

        return $this->reply(
            "Nos cours ont lieu en semaine et le samedi matin, selon les formations :\n\n• Soutien scolaire : 18h–20h en semaine, samedi matin\n• Formation continue : 18h30–21h en soirée\n• Langues : 18h–20h en semaine\n\nSouhaitez-vous un planning détaillé pour un pôle ?",
            $replies
        );
    }

    private function documents(?string $poleSlug): array
    {
        if ($poleSlug && ($pole = $this->pole($poleSlug))) {
            $items = $this->formationsFor($poleSlug)->filter(fn ($f) => ! empty($f->documents_required))->take(3);
            if ($items->isEmpty()) {
                return $this->reply(
                    "Pour {$pole->label}, fournissez votre pièce d'identité et un bulletin récent. Un conseiller pourra préciser selon votre cas.",
                    [self::MAIN_MENU_REPLY]
                );
            }
            $text = $items->map(function ($f) {
                $docs = collect($f->documents_required)->map(fn ($d) => '   • '.$d)->implode("\n");

                return '📄 '.$f->title." :\n".$docs;
            })->implode("\n\n");

            return $this->reply("Pièces à fournir pour {$pole->label} :\n\n{$text}", [
                ['label' => "M'inscrire", 'payload' => 'menu:inscription'],
                self::MAIN_MENU_REPLY,
            ]);
        }

        $replies = array_map(fn ($p) => ['label' => $p->label, 'payload' => 'documents:'.$p->slug], $this->poles());
        $replies[] = self::MAIN_MENU_REPLY;

        return $this->reply('Les documents demandés varient selon la formation. Pour quel pôle souhaitez-vous la liste ?', $replies);
    }

    private function contact(): array
    {
        return $this->reply(
            "Souhaitez-vous qu'un conseiller vous rappelle ?\n\n📧 contact@afg-academie.com\n📞 +212 5 22 00 00 00\n\nOu remplissez le formulaire de rappel.",
            [
                ['label' => 'Demander un rappel', 'payload' => 'action:callback'],
                ['label' => 'Voir le formulaire de contact', 'payload' => 'action:contact-page'],
                self::MAIN_MENU_REPLY,
            ],
            ['action' => 'contact']
        );
    }

    // ---- helpers ----

    private function reply(string $text, array $quickReplies = [], ?array $payload = null): array
    {
        // Provide both `payload` (frontend engine contract) and `value` (spec) on each quick reply.
        $quickReplies = array_map(fn ($qr) => [
            'label' => $qr['label'],
            'payload' => $qr['payload'],
            'value' => $qr['payload'],
        ], $quickReplies);

        return array_filter([
            'reply' => $text,
            'text' => $text,
            'quickReplies' => $quickReplies,
            'payload' => $payload,
        ], fn ($v) => $v !== null);
    }

    private function matches(string $haystack, array $keywords): bool
    {
        foreach ($keywords as $k) {
            if (str_contains($haystack, $k)) {
                return true;
            }
        }

        return false;
    }

    private function detectPole(string $text): ?string
    {
        foreach (self::POLE_KEYWORDS as $entry) {
            foreach ($entry['keys'] as $k) {
                if (str_contains($text, $k)) {
                    return $entry['pole'];
                }
            }
        }

        return null;
    }

    private function listFormations(string $poleSlug): string
    {
        $items = $this->formationsFor($poleSlug)->take(6);
        if ($items->isEmpty()) {
            return 'Aucune formation disponible pour le moment.';
        }

        return $items->map(fn ($f) => '• '.$f->title.' — '.$f->duration.', '.$this->price($f->price))->implode("\n");
    }

    /** @return \Illuminate\Support\Collection<int,\App\Models\Formation> */
    private function formationsFor(string $poleSlug)
    {
        return Formation::active()
            ->whereHas('pole', fn ($q) => $q->where('slug', $poleSlug))
            ->orderBy('title')
            ->get();
    }

    /** @return array<int,\App\Models\Pole> */
    private function poles(): array
    {
        return Pole::orderBy('id')->get()->all();
    }

    private function pole(string $slug): ?Pole
    {
        return Pole::with('categories')->where('slug', $slug)->first();
    }

    private function price(float|string|null $amount): string
    {
        $n = number_format((float) $amount, 0, ',', ' ');

        return $n.' MAD';
    }
}
