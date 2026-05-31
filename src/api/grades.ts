import { delay, http, useMocks } from "@/lib/httpClient";
import { mockGrades } from "@/mocks/grades";
import type { Grade } from "@/types";

export async function listGrades(filters: { eleveId?: string; formationId?: string } = {}): Promise<Grade[]> {
  if (useMocks) {
    await delay();
    return mockGrades.filter((g) => {
      if (filters.eleveId && g.eleveId !== filters.eleveId) return false;
      if (filters.formationId && g.formationId !== filters.formationId) return false;
      return true;
    });
  }
  const params = new URLSearchParams();
  if (filters.eleveId) params.set("eleveId", filters.eleveId);
  if (filters.formationId) params.set("formationId", filters.formationId);
  return http<Grade[]>(`/grades?${params.toString()}`);
}

export async function addGrade(input: Omit<Grade, "id">): Promise<Grade> {
  if (useMocks) {
    await delay();
    const g: Grade = { ...input, id: `g-${Math.random().toString(36).slice(2, 8)}` };
    mockGrades.push(g);
    return g;
  }
  return http<Grade>("/grades", { method: "POST", json: input });
}

export async function deleteGrade(id: string): Promise<void> {
  if (useMocks) {
    await delay();
    const idx = mockGrades.findIndex((g) => g.id === id);
    if (idx !== -1) mockGrades.splice(idx, 1);
    return;
  }
  await http<void>(`/grades/${id}`, { method: "DELETE" });
}
