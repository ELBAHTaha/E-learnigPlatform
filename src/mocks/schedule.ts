import type { Room, ScheduleSession } from "@/types";

export const mockRooms: Room[] = [
  { id: "r-1", name: "Salle A1", capacity: 20, building: "Bâtiment A", equipment: ["Vidéoprojecteur", "Tableau blanc"] },
  { id: "r-2", name: "Salle A2", capacity: 24, building: "Bâtiment A", equipment: ["Vidéoprojecteur"] },
  { id: "r-3", name: "Labo Sciences", capacity: 16, building: "Bâtiment A", equipment: ["Paillasses", "Hotte"] },
  { id: "r-4", name: "Salle B1", capacity: 30, building: "Bâtiment B", equipment: ["Vidéoprojecteur", "Système audio"] },
  { id: "r-5", name: "Amphi", capacity: 80, building: "Bâtiment B", equipment: ["Vidéoprojecteur", "Système audio", "Caméra"] },
  { id: "r-virt", name: "Salle virtuelle", capacity: 200, building: "En ligne" },
];

const today = new Date();
function dayAt(daysFromToday: number, hour: number, min: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

export const mockSessions: ScheduleSession[] = [
  {
    id: "s-1",
    formationId: "f-ss-maths-terminale",
    formateurId: "u-form-1",
    roomId: "r-1",
    start: dayAt(1, 10, 0),
    end: dayAt(1, 12, 0),
    title: "Maths Spé — Suites et limites",
  },
  {
    id: "s-2",
    formationId: "f-lg-allemand-deb",
    formateurId: "u-form-2",
    roomId: "r-2",
    start: dayAt(1, 18, 0),
    end: dayAt(1, 19, 30),
    title: "Allemand A1 — Présentation",
  },
  {
    id: "s-3",
    formationId: "f-fc-management",
    formateurId: "u-form-3",
    roomId: "r-4",
    start: dayAt(2, 18, 30),
    end: dayAt(2, 21, 0),
    title: "Management — Leadership",
    meetingUrl: "https://meet.afg-academie.com/management-1",
  },
  {
    id: "s-4",
    formationId: "f-ss-svt-lycee",
    formateurId: "u-form-4",
    roomId: "r-3",
    start: dayAt(3, 18, 0),
    end: dayAt(3, 19, 30),
    title: "SVT — Immunologie",
  },
  {
    id: "s-5",
    formationId: "f-lg-anglais-b2",
    formateurId: "u-form-2",
    roomId: "r-1",
    start: dayAt(5, 9, 0),
    end: dayAt(5, 12, 0),
    title: "Anglais TOEIC — Listening",
  },
  {
    id: "s-6",
    formationId: "f-fc-marketing-digital",
    formateurId: "u-form-3",
    roomId: "r-virt",
    start: dayAt(2, 19, 0),
    end: dayAt(2, 21, 0),
    title: "Marketing digital — Social ads",
    meetingUrl: "https://meet.afg-academie.com/marketing-1",
  },
  {
    id: "s-7",
    formationId: "f-lg-espagnol",
    formateurId: "u-form-5",
    roomId: "r-2",
    start: dayAt(0, 18, 30),
    end: dayAt(0, 20, 0),
    title: "Espagnol — Saludos",
  },
  {
    id: "s-8",
    formationId: "f-ss-maths-terminale",
    formateurId: "u-form-1",
    roomId: "r-1",
    start: dayAt(4, 10, 0),
    end: dayAt(4, 12, 0),
    title: "Maths Spé — Probabilités",
  },
];
