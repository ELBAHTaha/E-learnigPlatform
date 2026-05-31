import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  GraduationCap,
  Video,
  Megaphone,
  FileText,
  Users,
  School,
  DoorOpen,
  ClipboardList,
  FolderKanban,
  UserCog,
} from "lucide-react";
import type { NavItem } from "@/components/layout/Sidebar";

export const eleveNav: NavItem[] = [
  { to: "/eleve", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/eleve/formations", label: "Mes formations", icon: BookOpen },
  { to: "/eleve/emploi-du-temps", label: "Emploi du temps", icon: Calendar },
  { to: "/eleve/notes", label: "Mes notes", icon: GraduationCap },
  { to: "/eleve/visioconference", label: "Visioconférence", icon: Video },
  { to: "/eleve/annonces", label: "Annonces", icon: Megaphone },
  { to: "/eleve/dossier", label: "Dossier immigration", icon: FileText },
];

export const formateurNav: NavItem[] = [
  { to: "/formateur", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/formateur/cours", label: "Mes cours", icon: BookOpen },
  { to: "/formateur/notes", label: "Saisie des notes", icon: GraduationCap },
  { to: "/formateur/emploi-du-temps", label: "Emploi du temps", icon: Calendar },
  { to: "/formateur/eleves", label: "Mes élèves", icon: Users },
];

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: UserCog },
  { to: "/admin/formations", label: "Formations", icon: School },
  { to: "/admin/salles", label: "Salles", icon: DoorOpen },
  { to: "/admin/emploi-du-temps", label: "Emploi du temps", icon: Calendar },
  { to: "/admin/annonces", label: "Annonces", icon: Megaphone },
  { to: "/admin/inscriptions", label: "Inscriptions", icon: ClipboardList },
];

export const conseillerNav: NavItem[] = [
  { to: "/conseiller", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/conseiller/dossiers", label: "Dossiers immigration", icon: FolderKanban },
  { to: "/conseiller/eleves", label: "Élèves suivis", icon: Users },
];
