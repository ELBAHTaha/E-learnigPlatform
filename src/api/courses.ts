import { delay, http, useMocks } from "@/lib/httpClient";
import { mockResources } from "@/mocks/courses";
import type { CourseResource } from "@/types";

export async function listResources(formationId?: string): Promise<CourseResource[]> {
  if (useMocks) {
    await delay();
    return formationId
      ? mockResources.filter((r) => r.formationId === formationId)
      : [...mockResources];
  }
  return http<CourseResource[]>(
    `/resources${formationId ? `?formationId=${formationId}` : ""}`
  );
}

export async function addResource(
  input: Omit<CourseResource, "id" | "uploadedAt">
): Promise<CourseResource> {
  if (useMocks) {
    await delay(700);
    const r: CourseResource = {
      ...input,
      id: `c-${Math.random().toString(36).slice(2, 8)}`,
      uploadedAt: new Date().toISOString(),
    };
    mockResources.push(r);
    return r;
  }
  return http<CourseResource>("/resources", { method: "POST", json: input });
}

export async function deleteResource(id: string): Promise<void> {
  if (useMocks) {
    await delay();
    const idx = mockResources.findIndex((r) => r.id === id);
    if (idx !== -1) mockResources.splice(idx, 1);
    return;
  }
  await http<void>(`/resources/${id}`, { method: "DELETE" });
}
