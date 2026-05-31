import { delay, http, useMocks } from "@/lib/httpClient";
import { mockEnrollments } from "@/mocks/enrollments";
import type { Enrollment } from "@/types";

export async function listEnrollments(filters: { eleveId?: string; formationId?: string; status?: Enrollment["status"] } = {}): Promise<Enrollment[]> {
  if (useMocks) {
    await delay();
    return mockEnrollments.filter((e) => {
      if (filters.eleveId && e.eleveId !== filters.eleveId) return false;
      if (filters.formationId && e.formationId !== filters.formationId) return false;
      if (filters.status && e.status !== filters.status) return false;
      return true;
    });
  }
  const params = new URLSearchParams();
  if (filters.eleveId) params.set("eleveId", filters.eleveId);
  if (filters.formationId) params.set("formationId", filters.formationId);
  if (filters.status) params.set("status", filters.status);
  return http<Enrollment[]>(`/enrollments?${params.toString()}`);
}

export async function requestEnrollment(eleveId: string, formationId: string): Promise<Enrollment> {
  if (useMocks) {
    await delay();
    const e: Enrollment = {
      id: `e-${Math.random().toString(36).slice(2, 8)}`,
      eleveId,
      formationId,
      status: "en-attente",
      requestedAt: new Date().toISOString(),
      progress: 0,
    };
    mockEnrollments.push(e);
    return e;
  }
  return http<Enrollment>("/enrollments", {
    method: "POST",
    json: { eleveId, formationId },
  });
}

export async function decideEnrollment(
  id: string,
  status: "approuvee" | "refusee"
): Promise<Enrollment> {
  if (useMocks) {
    await delay();
    const e = mockEnrollments.find((x) => x.id === id);
    if (!e) throw new Error("Inscription introuvable");
    e.status = status;
    e.decidedAt = new Date().toISOString();
    return e;
  }
  return http<Enrollment>(`/enrollments/${id}/decide`, {
    method: "POST",
    json: { status },
  });
}
