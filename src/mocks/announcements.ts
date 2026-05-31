import type { Announcement } from "@/types";

export const mockAnnouncements: Announcement[] = [
  {
    id: "a-1",
    title: "Rentrée 2026 — Ouverture des inscriptions",
    body: "Les inscriptions pour la session de septembre 2026 sont ouvertes. Vous pouvez dès à présent vous inscrire à toutes nos formations via votre espace personnel.",
    audience: "tous",
    publishedAt: "2026-05-15T10:00:00Z",
    author: "Direction AFG",
    pinned: true,
  },
  {
    id: "a-2",
    title: "Examens blancs — Mai 2026",
    body: "Les Bacs blancs auront lieu du 26 au 30 mai. Pensez à consulter votre planning et à préparer le matériel demandé.",
    audience: ["eleve"],
    publishedAt: "2026-05-10T10:00:00Z",
    author: "Direction pédagogique",
  },
  {
    id: "a-3",
    title: "Atelier orientation post-bac",
    body: "Un atelier d'orientation gratuit est organisé samedi 7 juin à 10h00 dans l'amphithéâtre. Inscriptions auprès du secrétariat.",
    audience: ["eleve"],
    publishedAt: "2026-05-22T10:00:00Z",
    author: "Direction AFG",
  },
  {
    id: "a-4",
    title: "Réunion pédagogique mensuelle",
    body: "La prochaine réunion pédagogique aura lieu vendredi 6 juin à 17h00. Présence obligatoire de tous les formateurs.",
    audience: ["formateur"],
    publishedAt: "2026-05-25T10:00:00Z",
    author: "Direction pédagogique",
  },
];
