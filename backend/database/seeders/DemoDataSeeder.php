<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Assessment;
use App\Models\Category;
use App\Models\ClassSession;
use App\Models\CourseMaterial;
use App\Models\DossierMessage;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\Grade;
use App\Models\ImmigrationDocument;
use App\Models\ImmigrationDossier;
use App\Models\Pole;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    /** @var array<string,\App\Models\User> */
    private array $users = [];
    /** @var array<string,\App\Models\Formation> */
    private array $formations = [];
    /** @var array<string,\App\Models\Room> */
    private array $rooms = [];
    /** @var array<string,\App\Models\Pole> */
    private array $poles = [];

    private const DEMO_EMAILS = [
        'admin@afg-academie.com',
        'y.bennani@afg-academie.com',
        'yassine.elfassi@afg-academie.com',
        'a.zaki@afg-academie.com',
    ];

    public function run(): void
    {
        $this->poles = Pole::all()->keyBy('slug')->all();

        $this->seedUsers();
        $this->seedFormations();
        $this->seedMaterials();
        $this->seedRooms();
        $this->seedSessions();
        $this->seedEnrollments();
        $this->seedGrades();
        $this->seedDossiers();
        $this->seedAnnouncements();
    }

    private function password(string $email): string
    {
        return Hash::make(in_array($email, self::DEMO_EMAILS, true) ? 'demo' : 'password');
    }

    private function makeUser(string $handle, array $attrs, string $role): User
    {
        $email = $attrs['email'];
        // Demo-login accounts must always be active so the SPA demo buttons work.
        if (in_array($email, self::DEMO_EMAILS, true)) {
            $attrs['is_active'] = true;
        }
        $user = User::updateOrCreate(['email' => $email], array_merge([
            'password' => $this->password($email),
            'locale' => 'fr',
            'is_active' => true,
        ], $attrs));
        $user->syncRoles([$role]);
        $this->users[$handle] = $user;

        return $user;
    }

    private function seedUsers(): void
    {
        $this->makeUser('u-admin-1', [
            'first_name' => 'Khadija', 'last_name' => 'El Amrani',
            'email' => 'admin@afg-academie.com', 'phone' => '+212 661 11 22 33', 'city' => 'Casablanca',
        ], 'admin');

        $this->makeUser('u-admin-2', [
            'first_name' => 'Omar', 'last_name' => 'Berrada',
            'email' => 'direction@afg-academie.com', 'phone' => '+212 661 44 55 66', 'city' => 'Casablanca',
        ], 'admin');

        $formateurs = [
            ['u-form-1', 'Youssef', 'Bennani', 'y.bennani@afg-academie.com', 'Casablanca', ['Mathématiques', 'Physique-Chimie'], 'Agrégé de mathématiques, 12 ans d\'expérience en lycée et en classes préparatoires.'],
            ['u-form-2', 'Salma', 'Tazi', 's.tazi@afg-academie.com', 'Rabat', ['Anglais', 'Allemand'], 'Linguiste diplômée du Goethe-Institut, formatrice certifiée Cambridge.'],
            ['u-form-3', 'Karim', 'Idrissi', 'k.idrissi@afg-academie.com', 'Casablanca', ['Management', 'Marketing'], 'Consultant senior, MBA HEC, ancien directeur marketing chez Renault Maroc.'],
            ['u-form-4', 'Nadia', 'Alaoui', 'n.alaoui@afg-academie.com', 'Tanger', ['SVT', 'Biologie'], 'Docteure en biologie cellulaire, enseignante depuis 8 ans.'],
            ['u-form-5', 'Hugo', 'Lopez', 'h.lopez@afg-academie.com', 'Casablanca', ['Espagnol', 'Chinois'], 'Native espagnol, certifié HSK 5, bilingue mandarin.'],
            ['u-form-6', 'Fatima', 'Cherkaoui', 'f.cherkaoui@afg-academie.com', 'Casablanca', ['Comptabilité', 'Finance'], 'Expert-comptable, formatrice professionnelle reconnue.'],
        ];
        foreach ($formateurs as [$h, $fn, $ln, $email, $city, $spec, $bio]) {
            $this->makeUser($h, [
                'first_name' => $fn, 'last_name' => $ln, 'email' => $email, 'city' => $city,
                'specialties' => $spec, 'bio' => $bio,
            ], 'formateur');
        }

        $conseillers = [
            ['u-cons-1', 'Amina', 'Zaki', 'a.zaki@afg-academie.com', ['Canada', 'France']],
            ['u-cons-2', 'Rachid', 'Benali', 'r.benali@afg-academie.com', ['Allemagne', 'Belgique', 'Suisse']],
        ];
        foreach ($conseillers as [$h, $fn, $ln, $email, $terr]) {
            $this->makeUser($h, [
                'first_name' => $fn, 'last_name' => $ln, 'email' => $email, 'city' => 'Casablanca',
                'territories' => $terr,
            ], 'conseiller');
        }

        // 30 élèves — mirrors the generator in src/mocks/users.ts
        $firstNames = ['Yassine', 'Aya', 'Mehdi', 'Ines', 'Adam', 'Lina', 'Omar', 'Sara', 'Imran', 'Nour', 'Anas', 'Hiba', 'Reda', 'Zineb', 'Walid', 'Maha', 'Othmane', 'Salma', 'Hamza', 'Rim', 'Ayoub', 'Kenza', 'Bilal', 'Soukaina', 'Achraf', 'Yasmine', 'Ilyas', 'Sofia', 'Marouane', 'Amal'];
        $lastNames = ['El Fassi', 'Bouazza', 'Sahraoui', 'Mansouri', 'Berrada', 'Benjelloun', 'Kabbaj', 'Lahlou', 'Saidi', 'Ouazzani', 'Naciri', 'Tahiri', 'Skiredj', 'Belhaj', 'Drissi', 'Akhdar', 'Chraibi', 'Filali', 'Mekouar', 'Boukhriss'];
        $cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir'];
        $polesArr = ['soutien-scolaire', 'formation-continue', 'immigration', 'langues'];
        $levels = ['Collège', 'Lycée', 'Bac+1', 'Professionnel'];

        foreach ($firstNames as $i => $fn) {
            $ln = $lastNames[$i % count($lastNames)];
            $email = strtolower($fn).'.'.strtolower(str_replace(' ', '', $ln)).'@afg-academie.com';
            $this->makeUser('u-eleve-'.($i + 1), [
                'first_name' => $fn, 'last_name' => $ln, 'email' => $email,
                'city' => $cities[$i % count($cities)],
                'is_active' => $i % 17 !== 0,
                'level' => $levels[$i % 4],
                'interested_pole' => $polesArr[$i % count($polesArr)],
            ], 'eleve');
        }
    }

    private function categoryId(string $poleSlug, string $label): ?int
    {
        $pole = $this->poles[$poleSlug] ?? null;
        if (! $pole) {
            return null;
        }

        return Category::where('pole_id', $pole->id)->where('label', $label)->value('id');
    }

    private function seedFormations(): void
    {
        $data = $this->formationsData();
        foreach ($data as $f) {
            $formation = Formation::updateOrCreate(
                ['slug' => $f['slug']],
                [
                    'title' => $f['title'],
                    'pole_id' => $this->poles[$f['pole']]->id,
                    'category_id' => $this->categoryId($f['pole'], $f['subcategory']),
                    'description' => $f['description'],
                    'long_description' => $f['longDescription'] ?? null,
                    'level' => $f['level'],
                    'modality' => $f['modality'] ?? null,
                    'duration' => $f['duration'] ?? null,
                    'price' => $f['price'],
                    'currency' => 'MAD',
                    'payment_options' => ['echelonnement' => '3x sans frais', 'reduction_famille' => '10%', 'reduction_reinscription' => '15%'],
                    'schedule' => $f['schedule'] ?? null,
                    'capacity' => $f['capacity'],
                    'rating' => $f['rating'] ?? null,
                    'highlights' => $f['highlights'] ?? null,
                    'documents_required' => $f['documentsRequired'] ?? null,
                    'image_color' => $f['imageColor'] ?? ($this->poles[$f['pole']]->color ?? null),
                    'is_active' => true,
                    'formateur_id' => isset($f['formateur']) ? ($this->users[$f['formateur']]->id ?? null) : null,
                ],
            );
            $this->formations[$f['slug']] = $formation;
        }
    }

    private function seedMaterials(): void
    {
        $materials = [
            ['f-ss-maths-terminale', 'cours', 'Suites — Cours complet', '2.4 MB', 'u-form-1'],
            ['f-ss-maths-terminale', 'exercice', 'Suites — Exercices d\'entraînement', '1.1 MB', 'u-form-1'],
            ['f-ss-maths-terminale', 'corrige', 'Suites — Corrigé des exercices', '1.4 MB', 'u-form-1'],
            ['f-ss-maths-terminale', 'video', 'Méthode — Étudier la limite d\'une suite', '85 MB', 'u-form-1'],
            ['f-ss-maths-terminale', 'cours', 'Fonctions — Continuité et dérivation', '3.1 MB', 'u-form-1'],
            ['f-ss-maths-terminale', 'exercice', 'Fonctions — Annales corrigées', '2.0 MB', 'u-form-1'],
            ['f-lg-anglais-b2', 'cours', 'Vocabulary — Business essentials', '1.6 MB', 'u-form-2'],
            ['f-lg-anglais-b2', 'exercice', 'Listening — Practice test 1', '45 MB', 'u-form-2'],
            ['f-lg-anglais-b2', 'corrige', 'Listening — Answer key 1', '0.8 MB', 'u-form-2'],
            ['f-lg-allemand-deb', 'cours', 'Begrüßungen — Cours d\'introduction', '1.2 MB', 'u-form-2'],
            ['f-lg-allemand-deb', 'exercice', 'Begrüßungen — Übungen', '0.7 MB', 'u-form-2'],
            ['f-lg-allemand-deb', 'video', 'Aussprache — Prononciation', '62 MB', 'u-form-2'],
        ];

        foreach ($materials as $order => [$slug, $type, $title, $size, $uploader]) {
            $formation = $this->formations[$slug] ?? null;
            if (! $formation) {
                continue;
            }
            CourseMaterial::updateOrCreate(
                ['formation_id' => $formation->id, 'title' => $title],
                [
                    'type' => $type,
                    'uploader_id' => $this->users[$uploader]->id ?? $formation->formateur_id,
                    'disk' => $type === 'corrige' ? 'private' : 'public',
                    'file_size' => $this->sizeToBytes($size),
                    'external_video_url' => $type === 'video' ? 'https://videos.afg-academie.com/'.Str::slug($title) : null,
                    'order' => $order,
                ],
            );
        }
    }

    private function sizeToBytes(string $size): int
    {
        [$n, $unit] = array_pad(explode(' ', $size), 2, 'MB');
        $mult = strtoupper($unit) === 'KB' ? 1024 : 1024 * 1024;

        return (int) round((float) $n * $mult);
    }

    private function seedRooms(): void
    {
        $rooms = [
            ['r-1', 'Salle A1', 20, 'Bâtiment A', ['Vidéoprojecteur', 'Tableau blanc']],
            ['r-2', 'Salle A2', 24, 'Bâtiment A', ['Vidéoprojecteur']],
            ['r-3', 'Labo Sciences', 16, 'Bâtiment A', ['Paillasses', 'Hotte']],
            ['r-4', 'Salle B1', 30, 'Bâtiment B', ['Vidéoprojecteur', 'Système audio']],
            ['r-5', 'Amphi', 80, 'Bâtiment B', ['Vidéoprojecteur', 'Système audio', 'Caméra']],
            ['r-virt', 'Salle virtuelle', 200, 'En ligne', []],
        ];
        foreach ($rooms as [$h, $name, $cap, $building, $equip]) {
            $this->rooms[$h] = Room::updateOrCreate(
                ['name' => $name],
                ['capacity' => $cap, 'building' => $building, 'equipment' => $equip, 'is_active' => true],
            );
        }
    }

    private function dayAt(int $daysFromToday, int $hour, int $min): Carbon
    {
        return Carbon::now()->addDays($daysFromToday)->setTime($hour, $min, 0);
    }

    private function seedSessions(): void
    {
        $sessions = [
            ['f-ss-maths-terminale', 'u-form-1', 'r-1', 1, [10, 0], [12, 0], 'Maths Spé — Suites et limites', null],
            ['f-lg-allemand-deb', 'u-form-2', 'r-2', 1, [18, 0], [19, 30], 'Allemand A1 — Présentation', null],
            ['f-fc-management', 'u-form-3', 'r-4', 2, [18, 30], [21, 0], 'Management — Leadership', 'https://meet.afg-academie.com/management-1'],
            ['f-ss-svt-lycee', 'u-form-4', 'r-3', 3, [18, 0], [19, 30], 'SVT — Immunologie', null],
            ['f-lg-anglais-b2', 'u-form-2', 'r-1', 5, [9, 0], [12, 0], 'Anglais TOEIC — Listening', null],
            ['f-fc-marketing-digital', 'u-form-3', 'r-virt', 2, [19, 0], [21, 0], 'Marketing digital — Social ads', 'https://meet.afg-academie.com/marketing-1'],
            ['f-lg-espagnol', 'u-form-5', 'r-2', 0, [18, 30], [20, 0], 'Espagnol — Saludos', null],
            ['f-ss-maths-terminale', 'u-form-1', 'r-1', 4, [10, 0], [12, 0], 'Maths Spé — Probabilités', null],
        ];

        $jitsiServer = rtrim((string) config('services.jitsi.server', 'https://meet.jit.si'), '/');

        foreach ($sessions as [$fSlug, $formateur, $room, $day, $startHM, $endHM, $title, $hasMeeting]) {
            $formation = $this->formations[$fSlug] ?? null;
            if (! $formation) {
                continue;
            }
            $roomModel = $this->rooms[$room] ?? null;
            $isOnline = $room === 'r-virt';

            // Build a Jitsi room for online/virtual sessions (deterministic slug).
            $roomName = $hasMeeting
                ? 'afg-'.\Illuminate\Support\Str::slug($title)
                : null;

            ClassSession::updateOrCreate(
                ['formation_id' => $formation->id, 'title' => $title],
                [
                    'formateur_id' => $this->users[$formateur]->id ?? $formation->formateur_id,
                    'room_id' => $roomModel?->id,
                    'starts_at' => $this->dayAt($day, $startHM[0], $startHM[1]),
                    'ends_at' => $this->dayAt($day, $endHM[0], $endHM[1]),
                    'is_online' => $isOnline,
                    'meeting_id' => $roomName,
                    'meeting_url' => $roomName ? "{$jitsiServer}/{$roomName}" : null,
                    'status' => 'scheduled',
                ],
            );
        }
    }

    private function seedEnrollments(): void
    {
        $enrollments = [
            ['u-eleve-1', 'f-ss-maths-terminale', 'approuvee', 65, '-9 months', '-9 months'],
            ['u-eleve-1', 'f-lg-anglais-b2', 'approuvee', 40, '-9 months', '-9 months'],
            ['u-eleve-2', 'f-lg-allemand-deb', 'approuvee', 30, '-8 months', '-8 months'],
            ['u-eleve-3', 'f-fc-management', 'approuvee', 55, '-8 months', '-8 months'],
            ['u-eleve-4', 'f-im-canada', 'approuvee', 25, '-7 months', '-7 months'],
            ['u-eleve-5', 'f-ss-svt-lycee', 'en-attente', 0, '-20 days', null],
            ['u-eleve-6', 'f-lg-espagnol', 'en-attente', 0, '-17 days', null],
            ['u-eleve-1', 'f-im-canada', 'approuvee', 30, '-7 months', '-7 months'],
        ];

        foreach ($enrollments as [$eleve, $fSlug, $status, $progress, $reqAt, $decAt]) {
            $eleveModel = $this->users[$eleve] ?? null;
            $formation = $this->formations[$fSlug] ?? null;
            if (! $eleveModel || ! $formation) {
                continue;
            }
            Enrollment::updateOrCreate(
                ['eleve_id' => $eleveModel->id, 'formation_id' => $formation->id],
                [
                    'status' => $status,
                    'progress' => $progress,
                    'requested_pole' => $formation->pole->slug ?? null,
                    'requested_at' => Carbon::parse($reqAt),
                    'decided_by' => $decAt ? ($this->users['u-admin-1']->id) : null,
                    'decided_at' => $decAt ? Carbon::parse($decAt) : null,
                ],
            );
        }
    }

    private function seedGrades(): void
    {
        $grades = [
            ['u-eleve-1', 'f-ss-maths-terminale', 'DS 1 — Suites', 14, 20, '2025-10-15', 'Bonne maîtrise des récurrences.'],
            ['u-eleve-1', 'f-ss-maths-terminale', 'DS 2 — Fonctions', 15.5, 20, '2025-11-12', null],
            ['u-eleve-1', 'f-ss-maths-terminale', 'DS 3 — Probabilités', 16, 20, '2025-12-10', 'Excellent travail.'],
            ['u-eleve-1', 'f-ss-maths-terminale', 'Bac blanc 1', 14.5, 20, '2026-01-20', null],
            ['u-eleve-1', 'f-ss-maths-terminale', 'DS 4 — Géométrie', 17, 20, '2026-03-15', null],
            ['u-eleve-1', 'f-lg-anglais-b2', 'Listening 1', 75, 100, '2025-10-20', null],
            ['u-eleve-1', 'f-lg-anglais-b2', 'Reading 1', 82, 100, '2025-11-18', null],
            ['u-eleve-1', 'f-lg-anglais-b2', 'TOEIC blanc', 780, 990, '2026-02-15', null],
            ['u-eleve-2', 'f-lg-allemand-deb', 'Test 1 — Salutations', 13, 20, '2025-10-25', null],
            ['u-eleve-2', 'f-lg-allemand-deb', 'Test 2 — Famille', 15, 20, '2025-11-22', null],
            ['u-eleve-2', 'f-lg-allemand-deb', 'Test 3 — Vie quotidienne', 14, 20, '2025-12-20', null],
        ];

        foreach ($grades as [$eleve, $fSlug, $label, $score, $outOf, $date, $comment]) {
            $eleveModel = $this->users[$eleve] ?? null;
            $formation = $this->formations[$fSlug] ?? null;
            if (! $eleveModel || ! $formation) {
                continue;
            }
            $assessment = Assessment::updateOrCreate(
                ['formation_id' => $formation->id, 'title' => $label],
                ['type' => Str::contains($label, 'blanc') ? 'examen' : 'devoir', 'max_score' => $outOf, 'date' => $date],
            );
            Grade::updateOrCreate(
                ['eleve_id' => $eleveModel->id, 'assessment_id' => $assessment->id],
                [
                    'formation_id' => $formation->id,
                    'label' => $label,
                    'score' => $score,
                    'out_of' => $outOf,
                    'date' => $date,
                    'comment' => $comment,
                    'entered_by' => $formation->formateur_id,
                ],
            );
        }
    }

    private function seedDossiers(): void
    {
        $dossiers = [
            [
                'eleve' => 'u-eleve-1', 'conseiller' => 'u-cons-1', 'destination' => 'Canada',
                'program' => 'Permis d\'études', 'status' => 'en-cours', 'type' => 'preparation-dossier',
                'opened' => '2025-10-12', 'updated' => '2026-05-20',
                'docs' => [
                    ['Passeport', true], ['Diplôme du Bac traduit', true],
                    ['Relevés bancaires (3 mois)', false, 'À fournir avant le 15 juin.'],
                    ['Lettre de motivation', true], ['CV détaillé', false], ['Lettre d\'admission CAQ', false],
                ],
                'notes' => [
                    ['Amina Zaki', '2026-05-20', 'Premier entretien réalisé. Profil prometteur, à orienter vers le PEQ.'],
                    ['Amina Zaki', '2026-05-25', 'Documents financiers manquants — relance par email envoyée.'],
                ],
            ],
            [
                'eleve' => 'u-eleve-4', 'conseiller' => 'u-cons-1', 'destination' => 'Canada',
                'program' => 'Permis de travail', 'status' => 'documents-requis', 'type' => 'preparation-dossier',
                'opened' => '2025-11-01', 'updated' => '2026-05-18',
                'docs' => [
                    ['Passeport', true], ['CV', true], ['Offre d\'emploi LMIA', false], ['Justificatif de financement', false],
                ],
                'notes' => [['Amina Zaki', '2026-05-10', 'En attente de l\'offre LMIA de l\'employeur.']],
            ],
            [
                'eleve' => 'u-eleve-7', 'conseiller' => 'u-cons-2', 'destination' => 'Allemagne',
                'program' => 'Ausbildung', 'status' => 'nouveau', 'type' => 'preparation-dossier',
                'opened' => '2026-05-22', 'updated' => '2026-05-22',
                'docs' => [['Passeport', false], ['Certificat Goethe B1', false], ['Diplôme Bac traduit', false]],
                'notes' => [],
            ],
            [
                'eleve' => 'u-eleve-9', 'conseiller' => 'u-cons-1', 'destination' => 'France',
                'program' => 'Visa étudiant', 'status' => 'soumis', 'type' => 'preparation-dossier',
                'opened' => '2025-09-01', 'updated' => '2026-04-15',
                'docs' => [
                    ['Passeport', true], ['Acceptation Campus France', true],
                    ['Justificatif de financement', true], ['Assurance santé', true],
                ],
                'notes' => [['Amina Zaki', '2026-04-15', 'Dossier déposé auprès du consulat. Réponse attendue sous 30 jours.']],
            ],
            [
                'eleve' => 'u-eleve-11', 'conseiller' => 'u-cons-2', 'destination' => 'Belgique',
                'program' => 'Visa étudiant', 'status' => 'finalise', 'type' => 'preparation-dossier',
                'opened' => '2024-12-01', 'updated' => '2025-08-30',
                'docs' => [],
                'notes' => [['Rachid Benali', '2025-08-30', 'Visa accordé. Départ confirmé pour septembre.']],
            ],
        ];

        foreach ($dossiers as $d) {
            $eleve = $this->users[$d['eleve']] ?? null;
            $conseiller = $this->users[$d['conseiller']] ?? null;
            if (! $eleve) {
                continue;
            }
            $dossier = ImmigrationDossier::updateOrCreate(
                ['eleve_id' => $eleve->id, 'destination_country' => $d['destination'], 'program_type' => $d['program']],
                [
                    'conseiller_id' => $conseiller?->id,
                    'type' => $d['type'],
                    'status' => $d['status'],
                    'opened_at' => Carbon::parse($d['opened']),
                    'created_at' => Carbon::parse($d['opened']),
                    'updated_at' => Carbon::parse($d['updated']),
                ],
            );

            $dossier->documents()->delete();
            foreach ($d['docs'] as $doc) {
                ImmigrationDocument::create([
                    'dossier_id' => $dossier->id,
                    'name' => $doc[0],
                    'is_required' => true,
                    'provided' => $doc[1],
                    'status' => $doc[1] ? 'fourni' : 'a_fournir',
                    'notes' => $doc[2] ?? null,
                ]);
            }

            $dossier->messages()->delete();
            foreach ($d['notes'] as [$author, $date, $content]) {
                DossierMessage::create([
                    'dossier_id' => $dossier->id,
                    'sender_id' => $conseiller?->id,
                    'author_name' => $author,
                    'body' => $content,
                    'channel' => 'note',
                    'created_at' => Carbon::parse($date),
                    'updated_at' => Carbon::parse($date),
                ]);
            }
        }
    }

    private function seedAnnouncements(): void
    {
        $announcements = [
            ['Rentrée 2026 — Ouverture des inscriptions', 'Les inscriptions pour la session de septembre 2026 sont ouvertes. Vous pouvez dès à présent vous inscrire à toutes nos formations via votre espace personnel.', null, '2026-05-15', 'Direction AFG', true],
            ['Examens blancs — Mai 2026', 'Les Bacs blancs auront lieu du 26 au 30 mai. Pensez à consulter votre planning et à préparer le matériel demandé.', ['eleve'], '2026-05-10', 'Direction pédagogique', false],
            ['Atelier orientation post-bac', 'Un atelier d\'orientation gratuit est organisé samedi 7 juin à 10h00 dans l\'amphithéâtre. Inscriptions auprès du secrétariat.', ['eleve'], '2026-05-22', 'Direction AFG', false],
            ['Réunion pédagogique mensuelle', 'La prochaine réunion pédagogique aura lieu vendredi 6 juin à 17h00. Présence obligatoire de tous les formateurs.', ['formateur'], '2026-05-25', 'Direction pédagogique', false],
        ];

        foreach ($announcements as [$title, $body, $targets, $date, $author, $pinned]) {
            Announcement::updateOrCreate(
                ['title' => $title],
                [
                    'author_id' => $this->users['u-admin-1']->id ?? null,
                    'author_name' => $author,
                    'body' => $body,
                    'target_roles' => $targets,
                    'is_published' => true,
                    'pinned' => $pinned,
                    'published_at' => Carbon::parse($date),
                ],
            );
        }
    }

    /** The 14 formations from src/mocks/formations.ts. */
    private function formationsData(): array
    {
        return [
            ['slug' => 'f-ss-svt-lycee', 'title' => 'SVT — Préparation Bac', 'pole' => 'soutien-scolaire', 'subcategory' => 'SVT', 'level' => 'Avancé', 'description' => 'Programme intensif SVT pour la terminale, axé sur la réussite au Bac.', 'longDescription' => 'Ce programme couvre l\'ensemble du référentiel de SVT terminale (génétique, immunologie, géologie) avec des exercices types Bac chaque semaine et des annales corrigées.', 'duration' => '9 mois', 'price' => 4800, 'schedule' => 'Lundi & Jeudi 18h00-19h30', 'formateur' => 'u-form-4', 'capacity' => 18, 'rating' => 4.7, 'highlights' => ['Annales corrigées', 'Suivi individualisé', 'Évaluations mensuelles'], 'documentsRequired' => ['Bulletin de l\'année précédente', 'Pièce d\'identité de l\'élève'], 'modality' => 'Présentiel', 'imageColor' => '#1B2A4A'],
            ['slug' => 'f-ss-physique-1ere', 'title' => 'Physique-Chimie — Première', 'pole' => 'soutien-scolaire', 'subcategory' => 'Physique-Chimie', 'level' => 'Intermédiaire', 'description' => 'Méthodologie et résolution d\'exercices pour la première scientifique.', 'duration' => '8 mois', 'price' => 4200, 'schedule' => 'Mardi & Vendredi 17h30-19h00', 'formateur' => 'u-form-1', 'capacity' => 16, 'rating' => 4.6, 'highlights' => ['Travaux pratiques', 'Fiches méthodes'], 'documentsRequired' => ['Bulletin de l\'année précédente'], 'modality' => 'Présentiel'],
            ['slug' => 'f-ss-maths-terminale', 'title' => 'Mathématiques — Spé Terminale', 'pole' => 'soutien-scolaire', 'subcategory' => 'Mathématiques', 'level' => 'Avancé', 'description' => 'Approfondissement et préparation aux épreuves scientifiques.', 'duration' => '9 mois', 'price' => 5200, 'schedule' => 'Mercredi & Samedi 10h00-12h00', 'formateur' => 'u-form-1', 'capacity' => 20, 'rating' => 4.9, 'highlights' => ['Sujets type Bac', 'Préparation Concours', 'Annales détaillées'], 'documentsRequired' => ['Bulletins de première'], 'modality' => 'Hybride'],
            ['slug' => 'f-ss-maths-college', 'title' => 'Mathématiques — Collège', 'pole' => 'soutien-scolaire', 'subcategory' => 'Mathématiques', 'level' => 'Débutant', 'description' => 'Consolidation des bases pour les classes du collège.', 'duration' => '6 mois', 'price' => 2800, 'schedule' => 'Samedi 14h00-16h00', 'formateur' => 'u-form-1', 'capacity' => 15, 'rating' => 4.5, 'modality' => 'Présentiel'],
            ['slug' => 'f-fc-management', 'title' => 'Management d\'équipe', 'pole' => 'formation-continue', 'subcategory' => 'Management', 'level' => 'Intermédiaire', 'description' => 'Outils pratiques pour piloter et motiver vos équipes au quotidien.', 'longDescription' => 'Formation de 12 semaines avec ateliers de mise en situation, études de cas et coaching individuel.', 'duration' => '12 semaines', 'price' => 8500, 'schedule' => 'Jeudi 18h30-21h00', 'formateur' => 'u-form-3', 'capacity' => 25, 'rating' => 4.8, 'highlights' => ['Certificat AFG', 'Coaching individuel', 'Études de cas'], 'documentsRequired' => ['CV professionnel'], 'modality' => 'Hybride'],
            ['slug' => 'f-fc-marketing-digital', 'title' => 'Marketing digital — Niveau 1', 'pole' => 'formation-continue', 'subcategory' => 'Marketing', 'level' => 'Débutant', 'description' => 'Acquérez les fondamentaux du marketing digital et des réseaux sociaux.', 'duration' => '8 semaines', 'price' => 5800, 'schedule' => 'Mardi 19h00-21h00', 'formateur' => 'u-form-3', 'capacity' => 30, 'rating' => 4.6, 'modality' => 'À distance'],
            ['slug' => 'f-fc-compta', 'title' => 'Comptabilité générale', 'pole' => 'formation-continue', 'subcategory' => 'Comptabilité', 'level' => 'Débutant', 'description' => 'Maîtrisez les fondamentaux de la comptabilité d\'entreprise.', 'duration' => '10 semaines', 'price' => 6400, 'schedule' => 'Lundi & Mercredi 19h00-21h00', 'formateur' => 'u-form-6', 'capacity' => 20, 'rating' => 4.7, 'modality' => 'Présentiel'],
            ['slug' => 'f-im-canada', 'title' => 'Immigration au Canada — Conseil et préparation', 'pole' => 'immigration', 'subcategory' => 'Conseil', 'level' => 'Tous niveaux', 'description' => 'Préparez votre projet d\'immigration au Canada (étudiant ou travailleur).', 'longDescription' => 'Accompagnement complet : évaluation du profil, choix du programme (PEQ, Entrée Express), préparation des documents et relecture du dossier.', 'duration' => 'Variable', 'price' => 12000, 'formateur' => 'u-cons-1', 'capacity' => 40, 'rating' => 4.9, 'highlights' => ['Évaluation gratuite', 'Suivi jusqu\'à la décision', 'Préparation entretien'], 'documentsRequired' => ['Passeport en cours de validité', 'Diplômes traduits (français/anglais)', 'Relevés bancaires (3 derniers mois)', 'CV détaillé', 'Lettre de motivation'], 'modality' => 'Hybride', 'imageColor' => '#E8954A'],
            ['slug' => 'f-im-dossiers', 'title' => 'Préparation de dossiers — Allemagne', 'pole' => 'immigration', 'subcategory' => 'Préparation de dossiers', 'level' => 'Tous niveaux', 'description' => 'Assistance complète pour vos demandes de visa étudiant ou Ausbildung.', 'duration' => 'Variable', 'price' => 9500, 'formateur' => 'u-cons-2', 'capacity' => 30, 'rating' => 4.8, 'documentsRequired' => ['Passeport', 'Diplôme du Bac', 'Certificat Goethe B1 ou B2', 'Justificatif de financement'], 'modality' => 'Présentiel'],
            ['slug' => 'f-im-contrats', 'title' => 'Contrats à l\'étranger — Conseil juridique', 'pole' => 'immigration', 'subcategory' => 'Contrats à l\'étranger', 'level' => 'Tous niveaux', 'description' => 'Analyse de contrats de travail et conseils sur les conditions à l\'étranger.', 'duration' => 'Variable', 'price' => 4500, 'capacity' => 50, 'rating' => 4.6, 'modality' => 'À distance'],
            ['slug' => 'f-lg-allemand-deb', 'title' => 'Allemand — Débutant A1', 'pole' => 'langues', 'subcategory' => 'Allemand', 'level' => 'Débutant', 'description' => 'Premier contact avec la langue allemande, prêt pour le niveau A1.', 'longDescription' => 'Cours interactifs, mise en pratique de l\'oral et écriture, vocabulaire de la vie quotidienne, préparation à l\'examen Goethe Start Deutsch 1.', 'duration' => '16 semaines', 'price' => 4200, 'schedule' => 'Mardi & Jeudi 18h00-19h30', 'formateur' => 'u-form-2', 'capacity' => 18, 'rating' => 4.8, 'highlights' => ['Manuel inclus', 'Atelier conversation', 'Préparation Goethe A1'], 'documentsRequired' => ['Pièce d\'identité'], 'modality' => 'Présentiel'],
            ['slug' => 'f-lg-anglais-b2', 'title' => 'Anglais — Préparation TOEIC', 'pole' => 'langues', 'subcategory' => 'Anglais', 'level' => 'Intermédiaire', 'description' => 'Préparez efficacement le TOEIC en 10 semaines.', 'duration' => '10 semaines', 'price' => 5200, 'schedule' => 'Samedi 09h00-12h00', 'formateur' => 'u-form-2', 'capacity' => 20, 'rating' => 4.9, 'modality' => 'Présentiel'],
            ['slug' => 'f-lg-espagnol', 'title' => 'Espagnol — Débutant', 'pole' => 'langues', 'subcategory' => 'Espagnol', 'level' => 'Débutant', 'description' => 'Initiation à l\'espagnol pour communiquer dans des situations courantes.', 'duration' => '12 semaines', 'price' => 3800, 'schedule' => 'Lundi & Mercredi 18h30-20h00', 'formateur' => 'u-form-5', 'capacity' => 20, 'rating' => 4.5, 'modality' => 'Présentiel'],
            ['slug' => 'f-lg-chinois', 'title' => 'Chinois mandarin — Débutant', 'pole' => 'langues', 'subcategory' => 'Chinois', 'level' => 'Débutant', 'description' => 'Découvrez les bases du mandarin et de l\'écriture chinoise.', 'duration' => '16 semaines', 'price' => 5400, 'schedule' => 'Mercredi 18h00-20h00', 'formateur' => 'u-form-5', 'capacity' => 15, 'rating' => 4.7, 'modality' => 'Hybride'],
        ];
    }
}
