import type { Pole, Role } from "@/types";

export const POLES: { id: Pole; label: string; tagline: string; color: string }[] = [
  {
    id: "soutien-scolaire",
    label: "Soutien scolaire",
    tagline: "Accompagnement personnalisé pour réussir au lycée et au collège.",
    color: "#1B2A4A",
  },
  {
    id: "formation-continue",
    label: "Formation continue",
    tagline: "Développez vos compétences professionnelles à votre rythme.",
    color: "#2E4373",
  },
  {
    id: "immigration",
    label: "Immigration",
    tagline: "Étudier, travailler ou s'installer à l'étranger sereinement.",
    color: "#E8954A",
  },
  {
    id: "langues",
    label: "Langues étrangères",
    tagline: "Ouvrez-vous au monde grâce à des cours interactifs.",
    color: "#C9762F",
  },
];

export const SUBCATEGORIES: Record<Pole, string[]> = {
  "soutien-scolaire": ["SVT", "Physique-Chimie", "Mathématiques", "Autres"],
  "formation-continue": ["Management", "Marketing", "Comptabilité", "Autres"],
  immigration: [
    "Conseil",
    "Préparation de dossiers",
    "Contrats à l'étranger",
    "Autres",
  ],
  langues: ["Allemand", "Anglais", "Espagnol", "Chinois", "Autres"],
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  formateur: "Formateur",
  eleve: "Élève",
  conseiller: "Conseiller immigration",
};

export const IMMIGRATION_STATUS_LABELS = {
  nouveau: "Nouveau",
  "en-cours": "En cours",
  "documents-requis": "Documents requis",
  soumis: "Soumis",
  finalise: "Finalisé",
} as const;

export const IMMIGRATION_STATUS_TONES = {
  nouveau: "info",
  "en-cours": "warning",
  "documents-requis": "danger",
  soumis: "primary",
  finalise: "success",
} as const;

export const POLE_LABELS: Record<Pole, string> = Object.fromEntries(
  POLES.map((p) => [p.id, p.label])
) as Record<Pole, string>;

export const ACADEMY = {
  name: "AFG — Académie de Formation Globale",
  shortName: "AFG",
  tagline: "Apprenez ici. Brillez partout.",
  domain: "www.afg-academie.com",
  email: "contact@afg-academie.com",
  phone: "+212 5 22 00 00 00",
  address: "Casablanca, Maroc",
};
