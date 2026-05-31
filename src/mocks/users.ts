import type { User, Eleve, Formateur, Conseiller } from "@/types";

export const mockAdmin: User = {
  id: "u-admin-1",
  email: "admin@afg-academie.com",
  firstName: "Khadija",
  lastName: "El Amrani",
  role: "admin",
  phone: "+212 661 11 22 33",
  city: "Casablanca",
  createdAt: "2024-01-15T09:00:00Z",
  active: true,
};

export const mockFormateurs: Formateur[] = [
  {
    id: "u-form-1",
    email: "y.bennani@afg-academie.com",
    firstName: "Youssef",
    lastName: "Bennani",
    role: "formateur",
    phone: "+212 662 10 20 30",
    city: "Casablanca",
    createdAt: "2024-02-01T10:00:00Z",
    active: true,
    specialties: ["Mathématiques", "Physique-Chimie"],
    bio: "Agrégé de mathématiques, 12 ans d'expérience en lycée et en classes préparatoires.",
  },
  {
    id: "u-form-2",
    email: "s.tazi@afg-academie.com",
    firstName: "Salma",
    lastName: "Tazi",
    role: "formateur",
    phone: "+212 663 20 30 40",
    city: "Rabat",
    createdAt: "2024-02-10T10:00:00Z",
    active: true,
    specialties: ["Anglais", "Allemand"],
    bio: "Linguiste diplômée du Goethe-Institut, formatrice certifiée Cambridge.",
  },
  {
    id: "u-form-3",
    email: "k.idrissi@afg-academie.com",
    firstName: "Karim",
    lastName: "Idrissi",
    role: "formateur",
    phone: "+212 664 30 40 50",
    city: "Casablanca",
    createdAt: "2024-03-01T10:00:00Z",
    active: true,
    specialties: ["Management", "Marketing"],
    bio: "Consultant senior, MBA HEC, ancien directeur marketing chez Renault Maroc.",
  },
  {
    id: "u-form-4",
    email: "n.alaoui@afg-academie.com",
    firstName: "Nadia",
    lastName: "Alaoui",
    role: "formateur",
    phone: "+212 665 40 50 60",
    city: "Tanger",
    createdAt: "2024-03-15T10:00:00Z",
    active: true,
    specialties: ["SVT", "Biologie"],
    bio: "Docteure en biologie cellulaire, enseignante depuis 8 ans.",
  },
  {
    id: "u-form-5",
    email: "h.lopez@afg-academie.com",
    firstName: "Hugo",
    lastName: "Lopez",
    role: "formateur",
    phone: "+212 666 50 60 70",
    city: "Casablanca",
    createdAt: "2024-04-01T10:00:00Z",
    active: true,
    specialties: ["Espagnol", "Chinois"],
    bio: "Native espagnol, certifié HSK 5, bilingue mandarin.",
  },
  {
    id: "u-form-6",
    email: "f.cherkaoui@afg-academie.com",
    firstName: "Fatima",
    lastName: "Cherkaoui",
    role: "formateur",
    phone: "+212 667 60 70 80",
    city: "Casablanca",
    createdAt: "2024-04-15T10:00:00Z",
    active: true,
    specialties: ["Comptabilité", "Finance"],
    bio: "Expert-comptable, formatrice professionnelle reconnue.",
  },
];

export const mockConseillers: Conseiller[] = [
  {
    id: "u-cons-1",
    email: "a.zaki@afg-academie.com",
    firstName: "Amina",
    lastName: "Zaki",
    role: "conseiller",
    phone: "+212 668 70 80 90",
    city: "Casablanca",
    createdAt: "2024-02-05T10:00:00Z",
    active: true,
    territories: ["Canada", "France"],
  },
  {
    id: "u-cons-2",
    email: "r.benali@afg-academie.com",
    firstName: "Rachid",
    lastName: "Benali",
    role: "conseiller",
    phone: "+212 669 80 90 00",
    city: "Casablanca",
    createdAt: "2024-02-15T10:00:00Z",
    active: true,
    territories: ["Allemagne", "Belgique", "Suisse"],
  },
];

const firstNames = [
  "Yassine", "Aya", "Mehdi", "Ines", "Adam", "Lina", "Omar", "Sara",
  "Imran", "Nour", "Anas", "Hiba", "Reda", "Zineb", "Walid", "Maha",
  "Othmane", "Salma", "Hamza", "Rim", "Ayoub", "Kenza", "Bilal", "Soukaina",
  "Achraf", "Yasmine", "Ilyas", "Sofia", "Marouane", "Amal",
];
const lastNames = [
  "El Fassi", "Bouazza", "Sahraoui", "Mansouri", "Berrada", "Benjelloun",
  "Kabbaj", "Lahlou", "Saidi", "Ouazzani", "Naciri", "Tahiri", "Skiredj",
  "Belhaj", "Drissi", "Akhdar", "Chraibi", "Filali", "Mekouar", "Boukhriss",
];
const cities = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];
const polesArr = ["soutien-scolaire", "formation-continue", "immigration", "langues"] as const;

export const mockEleves: Eleve[] = firstNames.map((fn, i) => {
  const ln = lastNames[i % lastNames.length];
  return {
    id: `u-eleve-${i + 1}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/\s+/g, "")}@afg-academie.com`,
    firstName: fn,
    lastName: ln,
    role: "eleve",
    phone: `+212 6${(60 + i).toString().padStart(2, "0")} ${(10 + i).toString().padStart(2, "0")} ${((i * 7) % 100).toString().padStart(2, "0")} ${((i * 13) % 100).toString().padStart(2, "0")}`,
    city: cities[i % cities.length],
    createdAt: new Date(2024, 8 + (i % 4), 1 + (i % 27)).toISOString(),
    active: i % 17 !== 0,
    level: ["Collège", "Lycée", "Bac+1", "Professionnel"][i % 4],
    interestedPole: polesArr[i % polesArr.length],
  };
});

export const allUsers: User[] = [
  mockAdmin,
  ...mockFormateurs,
  ...mockConseillers,
  ...mockEleves,
];

export const demoAccounts = [
  { email: "admin@afg-academie.com", role: "admin" as const, label: "Administrateur" },
  { email: "y.bennani@afg-academie.com", role: "formateur" as const, label: "Formateur" },
  { email: "yassine.elfassi@afg-academie.com", role: "eleve" as const, label: "Élève" },
  { email: "a.zaki@afg-academie.com", role: "conseiller" as const, label: "Conseiller immigration" },
];
