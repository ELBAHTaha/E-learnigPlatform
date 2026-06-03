import { delay, http, useMocks } from "@/lib/httpClient";
import { mockSessions } from "@/mocks/schedule";
import { mockEnrollments } from "@/mocks/enrollments";
import type { ScheduleSession } from "@/types";

export async function listSessions(filters: {
  eleveId?: string;
  formateurId?: string;
  formationId?: string;
} = {}): Promise<ScheduleSession[]> {
  if (useMocks) {
    await delay();
    let formationIds: Set<string> | null = null;
    if (filters.eleveId) {
      formationIds = new Set(
        mockEnrollments
          .filter((e) => e.eleveId === filters.eleveId && e.status === "approuvee")
          .map((e) => e.formationId)
      );
    }
    return mockSessions.filter((s) => {
      if (filters.formateurId && s.formateurId !== filters.formateurId) return false;
      if (filters.formationId && s.formationId !== filters.formationId) return false;
      if (formationIds && !formationIds.has(s.formationId)) return false;
      return true;
    });
  }
  const params = new URLSearchParams();
  if (filters.eleveId) params.set("eleveId", filters.eleveId);
  if (filters.formateurId) params.set("formateurId", filters.formateurId);
  if (filters.formationId) params.set("formationId", filters.formationId);
  return http<ScheduleSession[]>(`/sessions?${params.toString()}`);
}

export async function createSession(input: Omit<ScheduleSession, "id">): Promise<ScheduleSession> {
  if (useMocks) {
    await delay();
    const s: ScheduleSession = {
      ...input,
      id: `s-${Math.random().toString(36).slice(2, 8)}`,
    };
    mockSessions.push(s);
    return s;
  }
  return http<ScheduleSession>("/sessions", { method: "POST", json: input });
}

export async function createMeeting(sessionId: string): Promise<ScheduleSession> {
  if (useMocks) {
    await delay();
    const s = mockSessions.find((x) => x.id === sessionId);
    if (s) {
      s.meetingUrl = `https://meet.jit.si/afg-demo-${sessionId}`;
      s.meetingId = `afg-demo-${sessionId}`;
    }
    return s!;
  }
  return http<ScheduleSession>(`/sessions/${sessionId}/meeting`, { method: "POST" });
}

export async function deleteSession(id: string): Promise<void> {
  if (useMocks) {
    await delay();
    const idx = mockSessions.findIndex((s) => s.id === id);
    if (idx !== -1) mockSessions.splice(idx, 1);
    return;
  }
  await http<void>(`/sessions/${id}`, { method: "DELETE" });
}

export function hasConflict(
  candidate: { roomId?: string; formateurId: string; start: string; end: string },
  existing: ScheduleSession[]
): ScheduleSession | undefined {
  const cs = new Date(candidate.start).getTime();
  const ce = new Date(candidate.end).getTime();
  return existing.find((s) => {
    const ss = new Date(s.start).getTime();
    const se = new Date(s.end).getTime();
    const overlap = cs < se && ce > ss;
    if (!overlap) return false;
    if (s.formateurId === candidate.formateurId) return true;
    if (candidate.roomId && s.roomId === candidate.roomId) return true;
    return false;
  });
}
