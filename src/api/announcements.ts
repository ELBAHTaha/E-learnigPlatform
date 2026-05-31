import { delay, http, useMocks } from "@/lib/httpClient";
import { mockAnnouncements } from "@/mocks/announcements";
import type { Announcement, Role } from "@/types";

export async function listAnnouncements(role?: Role): Promise<Announcement[]> {
  if (useMocks) {
    await delay();
    const sorted = [...mockAnnouncements].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    if (!role) return sorted;
    return sorted.filter((a) => a.audience === "tous" || a.audience.includes(role));
  }
  return http<Announcement[]>(`/announcements${role ? `?role=${role}` : ""}`);
}

export async function createAnnouncement(input: Omit<Announcement, "id" | "publishedAt">): Promise<Announcement> {
  if (useMocks) {
    await delay();
    const a: Announcement = {
      ...input,
      id: `a-${Math.random().toString(36).slice(2, 8)}`,
      publishedAt: new Date().toISOString(),
    };
    mockAnnouncements.unshift(a);
    return a;
  }
  return http<Announcement>("/announcements", { method: "POST", json: input });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (useMocks) {
    await delay();
    const idx = mockAnnouncements.findIndex((a) => a.id === id);
    if (idx !== -1) mockAnnouncements.splice(idx, 1);
    return;
  }
  await http<void>(`/announcements/${id}`, { method: "DELETE" });
}
