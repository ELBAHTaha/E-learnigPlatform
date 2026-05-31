import { delay, http, useMocks } from "@/lib/httpClient";
import { mockFormations } from "@/mocks/formations";
import type { Formation, Pole } from "@/types";

export interface FormationFilters {
  pole?: Pole;
  subcategory?: string;
  search?: string;
  level?: string;
}

export async function listFormations(filters: FormationFilters = {}): Promise<Formation[]> {
  if (useMocks) {
    await delay();
    const term = filters.search?.toLowerCase().trim();
    return mockFormations.filter((f) => {
      if (filters.pole && f.pole !== filters.pole) return false;
      if (filters.subcategory && f.subcategory !== filters.subcategory) return false;
      if (filters.level && f.level !== filters.level) return false;
      if (
        term &&
        !`${f.title} ${f.description} ${f.subcategory}`.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }
  const params = new URLSearchParams();
  if (filters.pole) params.set("pole", filters.pole);
  if (filters.subcategory) params.set("subcategory", filters.subcategory);
  if (filters.search) params.set("search", filters.search);
  if (filters.level) params.set("level", filters.level);
  return http<Formation[]>(`/formations?${params.toString()}`);
}

export async function getFormation(id: string): Promise<Formation | undefined> {
  if (useMocks) {
    await delay();
    return mockFormations.find((f) => f.id === id);
  }
  return http<Formation>(`/formations/${id}`);
}

export async function createFormation(
  input: Omit<Formation, "id" | "enrolled">
): Promise<Formation> {
  if (useMocks) {
    await delay();
    const f: Formation = {
      ...input,
      id: `f-${Math.random().toString(36).slice(2, 8)}`,
      enrolled: 0,
    };
    mockFormations.push(f);
    return f;
  }
  return http<Formation>("/formations", { method: "POST", json: input });
}

export async function updateFormation(id: string, patch: Partial<Formation>): Promise<Formation> {
  if (useMocks) {
    await delay();
    const idx = mockFormations.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error("Formation introuvable");
    mockFormations[idx] = { ...mockFormations[idx], ...patch };
    return mockFormations[idx];
  }
  return http<Formation>(`/formations/${id}`, { method: "PATCH", json: patch });
}

export async function deleteFormation(id: string): Promise<void> {
  if (useMocks) {
    await delay();
    const idx = mockFormations.findIndex((f) => f.id === id);
    if (idx !== -1) mockFormations.splice(idx, 1);
    return;
  }
  await http<void>(`/formations/${id}`, { method: "DELETE" });
}
