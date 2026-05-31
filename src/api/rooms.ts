import { delay, http, useMocks } from "@/lib/httpClient";
import { mockRooms } from "@/mocks/schedule";
import type { Room } from "@/types";

export async function listRooms(): Promise<Room[]> {
  if (useMocks) {
    await delay();
    return [...mockRooms];
  }
  return http<Room[]>("/rooms");
}

export async function createRoom(input: Omit<Room, "id">): Promise<Room> {
  if (useMocks) {
    await delay();
    const r: Room = { ...input, id: `r-${Math.random().toString(36).slice(2, 6)}` };
    mockRooms.push(r);
    return r;
  }
  return http<Room>("/rooms", { method: "POST", json: input });
}

export async function updateRoom(id: string, patch: Partial<Room>): Promise<Room> {
  if (useMocks) {
    await delay();
    const idx = mockRooms.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Salle introuvable");
    mockRooms[idx] = { ...mockRooms[idx], ...patch };
    return mockRooms[idx];
  }
  return http<Room>(`/rooms/${id}`, { method: "PATCH", json: patch });
}

export async function deleteRoom(id: string): Promise<void> {
  if (useMocks) {
    await delay();
    const idx = mockRooms.findIndex((r) => r.id === id);
    if (idx !== -1) mockRooms.splice(idx, 1);
    return;
  }
  await http<void>(`/rooms/${id}`, { method: "DELETE" });
}
