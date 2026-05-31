export type Role = "admin" | "formateur" | "eleve" | "conseiller";

export type Pole =
  | "soutien-scolaire"
  | "formation-continue"
  | "immigration"
  | "langues";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  city?: string;
  createdAt: string;
  active: boolean;
}

export interface Formateur extends User {
  role: "formateur";
  specialties: string[];
  bio?: string;
}

export interface Eleve extends User {
  role: "eleve";
  level?: string;
  interestedPole?: Pole;
}

export interface Conseiller extends User {
  role: "conseiller";
  territories?: string[];
}

export interface Formation {
  id: string;
  title: string;
  pole: Pole;
  subcategory: string;
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Tous niveaux";
  description: string;
  longDescription?: string;
  duration: string;
  price: number;
  schedule?: string;
  formateurId?: string;
  capacity: number;
  enrolled: number;
  rating?: number;
  highlights?: string[];
  documentsRequired?: string[];
  modality?: "Présentiel" | "À distance" | "Hybride";
  imageColor?: string;
}

export type ResourceType = "cours" | "exercice" | "corrige" | "video";

export interface CourseResource {
  id: string;
  formationId: string;
  type: ResourceType;
  title: string;
  uploadedAt: string;
  size?: string;
  url?: string;
}

export interface Enrollment {
  id: string;
  eleveId: string;
  formationId: string;
  status: "en-attente" | "approuvee" | "refusee" | "terminee";
  requestedAt: string;
  decidedAt?: string;
  progress: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  building?: string;
  equipment?: string[];
}

export interface ScheduleSession {
  id: string;
  formationId: string;
  formateurId: string;
  roomId?: string;
  start: string;
  end: string;
  title: string;
  meetingUrl?: string;
}

export interface Grade {
  id: string;
  eleveId: string;
  formationId: string;
  assessment: string;
  score: number;
  outOf: number;
  date: string;
  comment?: string;
}

export type ImmigrationStatus =
  | "nouveau"
  | "en-cours"
  | "documents-requis"
  | "soumis"
  | "finalise";

export interface ImmigrationDocument {
  id: string;
  name: string;
  required: boolean;
  provided: boolean;
  notes?: string;
}

export interface ImmigrationDossier {
  id: string;
  eleveId: string;
  destination: string;
  programType: string;
  status: ImmigrationStatus;
  conseillerId?: string;
  openedAt: string;
  updatedAt: string;
  documents: ImmigrationDocument[];
  notes: { id: string; author: string; date: string; content: string }[];
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: Role[] | "tous";
  publishedAt: string;
  author: string;
  pinned?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  quickReplies?: { label: string; payload: string }[];
  timestamp: string;
}
