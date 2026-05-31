import { delay, http, useMocks } from "@/lib/httpClient";
import { mockDossiers } from "@/mocks/immigration";
import type { ImmigrationDossier, ImmigrationStatus } from "@/types";

export async function listDossiers(filters: {
  eleveId?: string;
  conseillerId?: string;
  status?: ImmigrationStatus;
} = {}): Promise<ImmigrationDossier[]> {
  if (useMocks) {
    await delay();
    return mockDossiers.filter((d) => {
      if (filters.eleveId && d.eleveId !== filters.eleveId) return false;
      if (filters.conseillerId && d.conseillerId !== filters.conseillerId) return false;
      if (filters.status && d.status !== filters.status) return false;
      return true;
    });
  }
  const params = new URLSearchParams();
  if (filters.eleveId) params.set("eleveId", filters.eleveId);
  if (filters.conseillerId) params.set("conseillerId", filters.conseillerId);
  if (filters.status) params.set("status", filters.status);
  return http<ImmigrationDossier[]>(`/dossiers?${params.toString()}`);
}

export async function getDossier(id: string): Promise<ImmigrationDossier | undefined> {
  if (useMocks) {
    await delay();
    return mockDossiers.find((d) => d.id === id);
  }
  return http<ImmigrationDossier>(`/dossiers/${id}`);
}

export async function updateDossierStatus(id: string, status: ImmigrationStatus): Promise<ImmigrationDossier> {
  if (useMocks) {
    await delay();
    const d = mockDossiers.find((x) => x.id === id);
    if (!d) throw new Error("Dossier introuvable");
    d.status = status;
    d.updatedAt = new Date().toISOString();
    return d;
  }
  return http<ImmigrationDossier>(`/dossiers/${id}/status`, {
    method: "POST",
    json: { status },
  });
}

export async function toggleDocument(dossierId: string, documentId: string, provided: boolean): Promise<ImmigrationDossier> {
  if (useMocks) {
    await delay();
    const d = mockDossiers.find((x) => x.id === dossierId);
    if (!d) throw new Error("Dossier introuvable");
    const doc = d.documents.find((x) => x.id === documentId);
    if (doc) doc.provided = provided;
    d.updatedAt = new Date().toISOString();
    return d;
  }
  return http<ImmigrationDossier>(
    `/dossiers/${dossierId}/documents/${documentId}`,
    { method: "PATCH", json: { provided } }
  );
}

export async function addNote(dossierId: string, author: string, content: string): Promise<ImmigrationDossier> {
  if (useMocks) {
    await delay();
    const d = mockDossiers.find((x) => x.id === dossierId);
    if (!d) throw new Error("Dossier introuvable");
    d.notes.push({
      id: `n-${Math.random().toString(36).slice(2, 8)}`,
      author,
      date: new Date().toISOString(),
      content,
    });
    d.updatedAt = new Date().toISOString();
    return d;
  }
  return http<ImmigrationDossier>(`/dossiers/${dossierId}/notes`, {
    method: "POST",
    json: { author, content },
  });
}
