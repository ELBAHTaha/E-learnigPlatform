import type { CourseResource } from "@/types";

export const mockResources: CourseResource[] = [
  // Maths Spé
  { id: "c-1", formationId: "f-ss-maths-terminale", type: "cours", title: "Suites — Cours complet", uploadedAt: "2025-09-15T10:00:00Z", size: "2.4 MB", url: "#" },
  { id: "c-2", formationId: "f-ss-maths-terminale", type: "exercice", title: "Suites — Exercices d'entraînement", uploadedAt: "2025-09-17T10:00:00Z", size: "1.1 MB", url: "#" },
  { id: "c-3", formationId: "f-ss-maths-terminale", type: "corrige", title: "Suites — Corrigé des exercices", uploadedAt: "2025-09-22T10:00:00Z", size: "1.4 MB", url: "#" },
  { id: "c-4", formationId: "f-ss-maths-terminale", type: "video", title: "Méthode — Étudier la limite d'une suite", uploadedAt: "2025-09-25T10:00:00Z", size: "85 MB", url: "#" },
  { id: "c-5", formationId: "f-ss-maths-terminale", type: "cours", title: "Fonctions — Continuité et dérivation", uploadedAt: "2025-10-10T10:00:00Z", size: "3.1 MB", url: "#" },
  { id: "c-6", formationId: "f-ss-maths-terminale", type: "exercice", title: "Fonctions — Annales corrigées", uploadedAt: "2025-10-15T10:00:00Z", size: "2.0 MB", url: "#" },
  // Anglais TOEIC
  { id: "c-7", formationId: "f-lg-anglais-b2", type: "cours", title: "Vocabulary — Business essentials", uploadedAt: "2025-09-10T10:00:00Z", size: "1.6 MB", url: "#" },
  { id: "c-8", formationId: "f-lg-anglais-b2", type: "exercice", title: "Listening — Practice test 1", uploadedAt: "2025-09-12T10:00:00Z", size: "45 MB", url: "#" },
  { id: "c-9", formationId: "f-lg-anglais-b2", type: "corrige", title: "Listening — Answer key 1", uploadedAt: "2025-09-13T10:00:00Z", size: "0.8 MB", url: "#" },
  // Allemand
  { id: "c-10", formationId: "f-lg-allemand-deb", type: "cours", title: "Begrüßungen — Cours d'introduction", uploadedAt: "2025-09-18T10:00:00Z", size: "1.2 MB", url: "#" },
  { id: "c-11", formationId: "f-lg-allemand-deb", type: "exercice", title: "Begrüßungen — Übungen", uploadedAt: "2025-09-20T10:00:00Z", size: "0.7 MB", url: "#" },
  { id: "c-12", formationId: "f-lg-allemand-deb", type: "video", title: "Aussprache — Prononciation", uploadedAt: "2025-09-22T10:00:00Z", size: "62 MB", url: "#" },
];
