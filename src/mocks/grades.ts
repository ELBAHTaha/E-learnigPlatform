import type { Grade } from "@/types";

export const mockGrades: Grade[] = [
  // Élève 1 — Maths
  { id: "g-1", eleveId: "u-eleve-1", formationId: "f-ss-maths-terminale", assessment: "DS 1 — Suites", score: 14, outOf: 20, date: "2025-10-15", comment: "Bonne maîtrise des récurrences." },
  { id: "g-2", eleveId: "u-eleve-1", formationId: "f-ss-maths-terminale", assessment: "DS 2 — Fonctions", score: 15.5, outOf: 20, date: "2025-11-12" },
  { id: "g-3", eleveId: "u-eleve-1", formationId: "f-ss-maths-terminale", assessment: "DS 3 — Probabilités", score: 16, outOf: 20, date: "2025-12-10", comment: "Excellent travail." },
  { id: "g-4", eleveId: "u-eleve-1", formationId: "f-ss-maths-terminale", assessment: "Bac blanc 1", score: 14.5, outOf: 20, date: "2026-01-20" },
  { id: "g-5", eleveId: "u-eleve-1", formationId: "f-ss-maths-terminale", assessment: "DS 4 — Géométrie", score: 17, outOf: 20, date: "2026-03-15" },
  // Élève 1 — Anglais
  { id: "g-6", eleveId: "u-eleve-1", formationId: "f-lg-anglais-b2", assessment: "Listening 1", score: 75, outOf: 100, date: "2025-10-20" },
  { id: "g-7", eleveId: "u-eleve-1", formationId: "f-lg-anglais-b2", assessment: "Reading 1", score: 82, outOf: 100, date: "2025-11-18" },
  { id: "g-8", eleveId: "u-eleve-1", formationId: "f-lg-anglais-b2", assessment: "TOEIC blanc", score: 780, outOf: 990, date: "2026-02-15" },
  // Élève 2
  { id: "g-9", eleveId: "u-eleve-2", formationId: "f-lg-allemand-deb", assessment: "Test 1 — Salutations", score: 13, outOf: 20, date: "2025-10-25" },
  { id: "g-10", eleveId: "u-eleve-2", formationId: "f-lg-allemand-deb", assessment: "Test 2 — Famille", score: 15, outOf: 20, date: "2025-11-22" },
  { id: "g-11", eleveId: "u-eleve-2", formationId: "f-lg-allemand-deb", assessment: "Test 3 — Vie quotidienne", score: 14, outOf: 20, date: "2025-12-20" },
];
