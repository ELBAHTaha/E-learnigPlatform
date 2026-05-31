import { mockFormations } from "@/mocks/formations";
import { POLE_LABELS, POLES, SUBCATEGORIES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { ChatMessage, Pole } from "@/types";

export type QuickReply = { label: string; payload: string };

export interface BotResponse {
  text: string;
  quickReplies?: QuickReply[];
}

const MENU: QuickReply[] = [
  { label: "📚 Informations formations", payload: "menu:formations" },
  { label: "💶 Tarifs & modalités", payload: "menu:tarifs" },
  { label: "📝 Aide à l'inscription", payload: "menu:inscription" },
  { label: "📅 Planning & disponibilités", payload: "menu:planning" },
  { label: "📄 Documents à fournir", payload: "menu:documents" },
  { label: "📞 Contacter un conseiller", payload: "menu:contact" },
];

const MAIN_MENU_REPLY: QuickReply = {
  label: "↩️ Menu principal",
  payload: "menu:main",
};

const GREETING_KEYWORDS = ["bonjour", "salut", "hello", "bonsoir", "hi", "hey"];
const FORMATION_KEYWORDS = ["formation", "cours", "programme", "matiere", "matière"];
const PRICE_KEYWORDS = ["prix", "tarif", "coût", "cout", "combien", "frais", "paiement", "payer"];
const SCHEDULE_KEYWORDS = ["horaire", "planning", "créneau", "creneau", "disponibilité", "quand"];
const DOC_KEYWORDS = ["document", "pièce", "piece", "papier", "justificatif"];
const CONTACT_KEYWORDS = ["conseiller", "contact", "rappel", "email", "téléphone", "telephone"];

const POLE_KEYWORDS: { keys: string[]; pole: Pole }[] = [
  { keys: ["math", "svt", "physique", "lycée", "lycee", "collège", "college", "bac"], pole: "soutien-scolaire" },
  { keys: ["management", "marketing", "comptabilité", "comptabilite", "professionnel"], pole: "formation-continue" },
  { keys: ["immigration", "canada", "allemagne", "visa", "étranger", "etranger", "dossier", "expatriation"], pole: "immigration" },
  { keys: ["langue", "anglais", "allemand", "espagnol", "chinois", "toeic", "goethe"], pole: "langues" },
];

function detectPole(text: string): Pole | undefined {
  const t = text.toLowerCase();
  for (const { keys, pole } of POLE_KEYWORDS) {
    if (keys.some((k) => t.includes(k))) return pole;
  }
  return undefined;
}

function listFormationsForPole(pole: Pole): string {
  const items = mockFormations.filter((f) => f.pole === pole).slice(0, 6);
  if (items.length === 0) return "Aucune formation disponible pour le moment.";
  return items
    .map((f) => `• ${f.title} — ${f.duration}, ${formatPrice(f.price)}`)
    .join("\n");
}

function greetingResponse(): BotResponse {
  return {
    text:
      "Bonjour 👋 Je suis l'assistant AFG. Je peux vous aider à choisir une formation, comprendre les tarifs, préparer votre inscription ou contacter un conseiller. Que souhaitez-vous faire ?",
    quickReplies: MENU,
  };
}

function mainMenuResponse(): BotResponse {
  return {
    text: "Bien sûr, voici les sujets sur lesquels je peux vous aider :",
    quickReplies: MENU,
  };
}

function formationsMenuResponse(): BotResponse {
  return {
    text: "Pour quel pôle souhaitez-vous des informations ?",
    quickReplies: POLES.map((p) => ({
      label: p.label,
      payload: `pole:${p.id}`,
    })).concat([MAIN_MENU_REPLY]),
  };
}

function polesDetailResponse(pole: Pole): BotResponse {
  const subs = SUBCATEGORIES[pole].join(", ");
  return {
    text: `Voici notre offre en ${POLE_LABELS[pole]} :\n\n${listFormationsForPole(pole)}\n\nNos sous-catégories : ${subs}.`,
    quickReplies: [
      { label: "Tarifs de ce pôle", payload: `tarifs:${pole}` },
      { label: "Documents à fournir", payload: `documents:${pole}` },
      { label: "Planning type", payload: `planning:${pole}` },
      { label: "M'inscrire à une formation", payload: "menu:inscription" },
      MAIN_MENU_REPLY,
    ],
  };
}

function tarifsResponse(pole?: Pole): BotResponse {
  if (pole) {
    const items = mockFormations.filter((f) => f.pole === pole).slice(0, 6);
    const text = `Tarifs en ${POLE_LABELS[pole]} :\n\n${items
      .map((f) => `• ${f.title} — ${formatPrice(f.price)} (${f.duration})`)
      .join("\n")}\n\nNous proposons un paiement en plusieurs fois et des réductions familles (10%) ou réinscription (15%).`;
    return {
      text,
      quickReplies: [
        { label: "Comment m'inscrire ?", payload: "menu:inscription" },
        MAIN_MENU_REPLY,
      ],
    };
  }
  return {
    text:
      "Nos tarifs varient selon les pôles et les formations.\n\n💡 Bon à savoir :\n• Paiement en 3 fois sans frais\n• Réduction famille de 10%\n• Réduction réinscription de 15%\n• Frais d'inscription unique : 300 MAD\n\nSouhaitez-vous le tarif d'un pôle en particulier ?",
    quickReplies: POLES.map((p) => ({
      label: p.label,
      payload: `tarifs:${p.id}`,
    })).concat([MAIN_MENU_REPLY]),
  };
}

function inscriptionResponse(step = 1): BotResponse {
  switch (step) {
    case 1:
      return {
        text:
          "L'inscription se fait en 4 étapes simples :\n\n1️⃣ Choisir un pôle\n2️⃣ Sélectionner votre niveau / formation\n3️⃣ Renseigner vos informations personnelles\n4️⃣ Déposer les pièces justificatives\n\nPar quel pôle souhaitez-vous commencer ?",
        quickReplies: POLES.map((p) => ({
          label: p.label,
          payload: `pole:${p.id}`,
        })).concat([
          { label: "Créer mon compte", payload: "action:register" },
          MAIN_MENU_REPLY,
        ]),
      };
    default:
      return mainMenuResponse();
  }
}

function planningResponse(pole?: Pole): BotResponse {
  if (pole) {
    const items = mockFormations
      .filter((f) => f.pole === pole && f.schedule)
      .slice(0, 5);
    if (items.length === 0) {
      return {
        text: `Pour ${POLE_LABELS[pole]}, les créneaux sont définis individuellement avec le conseiller selon votre disponibilité.`,
        quickReplies: [
          { label: "Contacter un conseiller", payload: "menu:contact" },
          MAIN_MENU_REPLY,
        ],
      };
    }
    return {
      text: `Plannings types en ${POLE_LABELS[pole]} :\n\n${items
        .map((f) => `• ${f.title} — ${f.schedule}`)
        .join("\n")}`,
      quickReplies: [
        { label: "Tarifs de ce pôle", payload: `tarifs:${pole}` },
        MAIN_MENU_REPLY,
      ],
    };
  }
  return {
    text:
      "Nos cours ont lieu en semaine et le samedi matin, selon les formations :\n\n• Soutien scolaire : 18h–20h en semaine, samedi matin\n• Formation continue : 18h30–21h en soirée\n• Langues : 18h–20h en semaine\n\nSouhaitez-vous un planning détaillé pour un pôle ?",
    quickReplies: POLES.map((p) => ({
      label: p.label,
      payload: `planning:${p.id}`,
    })).concat([MAIN_MENU_REPLY]),
  };
}

function documentsResponse(pole?: Pole): BotResponse {
  if (pole) {
    const items = mockFormations
      .filter((f) => f.pole === pole && f.documentsRequired)
      .slice(0, 3);
    if (items.length === 0) {
      return {
        text: `Pour ${POLE_LABELS[pole]}, fournissez votre pièce d'identité et un bulletin récent. Un conseiller pourra préciser selon votre cas.`,
        quickReplies: [MAIN_MENU_REPLY],
      };
    }
    const text = items
      .map(
        (f) => `📄 ${f.title} :\n${f.documentsRequired!.map((d) => `   • ${d}`).join("\n")}`
      )
      .join("\n\n");
    return {
      text: `Pièces à fournir pour ${POLE_LABELS[pole]} :\n\n${text}`,
      quickReplies: [
        { label: "M'inscrire", payload: "menu:inscription" },
        MAIN_MENU_REPLY,
      ],
    };
  }
  return {
    text:
      "Les documents demandés varient selon la formation. Pour quel pôle souhaitez-vous la liste ?",
    quickReplies: POLES.map((p) => ({
      label: p.label,
      payload: `documents:${p.id}`,
    })).concat([MAIN_MENU_REPLY]),
  };
}

function contactResponse(): BotResponse {
  return {
    text:
      "Souhaitez-vous qu'un conseiller vous rappelle ?\n\n📧 contact@afg-academie.com\n📞 +212 5 22 00 00 00\n\nOu remplissez le formulaire de rappel.",
    quickReplies: [
      { label: "Demander un rappel", payload: "action:callback" },
      { label: "Voir le formulaire de contact", payload: "action:contact-page" },
      MAIN_MENU_REPLY,
    ],
  };
}

export function generateResponse(input: string): BotResponse {
  const text = input.trim();
  if (!text) return mainMenuResponse();
  const lower = text.toLowerCase();

  // Quick reply payloads
  if (text.startsWith("menu:")) {
    const key = text.slice(5);
    switch (key) {
      case "main":
        return mainMenuResponse();
      case "formations":
        return formationsMenuResponse();
      case "tarifs":
        return tarifsResponse();
      case "inscription":
        return inscriptionResponse();
      case "planning":
        return planningResponse();
      case "documents":
        return documentsResponse();
      case "contact":
        return contactResponse();
    }
  }
  if (text.startsWith("pole:")) {
    return polesDetailResponse(text.slice(5) as Pole);
  }
  if (text.startsWith("tarifs:")) {
    return tarifsResponse(text.slice(7) as Pole);
  }
  if (text.startsWith("planning:")) {
    return planningResponse(text.slice(9) as Pole);
  }
  if (text.startsWith("documents:")) {
    return documentsResponse(text.slice(10) as Pole);
  }
  if (text === "action:register") {
    return {
      text:
        "Parfait ! Cliquez sur le bouton « S'inscrire » en haut à droite du site pour créer votre compte en quelques minutes. Vous pourrez ensuite choisir vos formations depuis votre espace.",
      quickReplies: [MAIN_MENU_REPLY],
    };
  }
  if (text === "action:callback") {
    return {
      text:
        "Très bien. Veuillez écrire votre nom, votre téléphone et le sujet de votre demande, et un conseiller vous rappellera sous 24h ouvrées.",
      quickReplies: [MAIN_MENU_REPLY],
    };
  }
  if (text === "action:contact-page") {
    return {
      text:
        "Vous pouvez utiliser le formulaire de contact accessible depuis la page « Contact » du site. Notre équipe vous répond généralement sous 24h.",
      quickReplies: [MAIN_MENU_REPLY],
    };
  }

  // Free-text intent detection
  if (GREETING_KEYWORDS.some((k) => lower.includes(k))) return greetingResponse();
  if (CONTACT_KEYWORDS.some((k) => lower.includes(k))) return contactResponse();
  if (DOC_KEYWORDS.some((k) => lower.includes(k))) {
    return documentsResponse(detectPole(lower));
  }
  if (SCHEDULE_KEYWORDS.some((k) => lower.includes(k))) {
    return planningResponse(detectPole(lower));
  }
  if (PRICE_KEYWORDS.some((k) => lower.includes(k))) {
    return tarifsResponse(detectPole(lower));
  }
  if (FORMATION_KEYWORDS.some((k) => lower.includes(k))) {
    const pole = detectPole(lower);
    return pole ? polesDetailResponse(pole) : formationsMenuResponse();
  }

  const pole = detectPole(lower);
  if (pole) return polesDetailResponse(pole);

  return {
    text:
      "Je n'ai pas tout saisi. Voici les sujets sur lesquels je peux vous aider :",
    quickReplies: MENU,
  };
}

export function createInitialMessage(): ChatMessage {
  const r = greetingResponse();
  return {
    id: `m-${Date.now()}`,
    role: "bot",
    content: r.text,
    quickReplies: r.quickReplies,
    timestamp: new Date().toISOString(),
  };
}
