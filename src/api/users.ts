import { delay, http, useMocks } from "@/lib/httpClient";
import { allUsers, mockEleves, mockFormateurs, mockConseillers } from "@/mocks/users";
import type { User, Role } from "@/types";

export async function listUsers(role?: Role): Promise<User[]> {
  if (useMocks) {
    await delay();
    if (!role) return [...allUsers];
    return allUsers.filter((u) => u.role === role);
  }
  return http<User[]>(`/users${role ? `?role=${role}` : ""}`);
}

export async function getUser(id: string): Promise<User | undefined> {
  if (useMocks) {
    await delay();
    return allUsers.find((u) => u.id === id);
  }
  return http<User>(`/users/${id}`);
}

export async function listEleves(): Promise<User[]> {
  if (useMocks) {
    await delay();
    return [...mockEleves];
  }
  return http<User[]>("/users?role=eleve");
}

export async function listFormateurs(): Promise<User[]> {
  if (useMocks) {
    await delay();
    return [...mockFormateurs];
  }
  return http<User[]>("/users?role=formateur");
}

export async function listConseillers(): Promise<User[]> {
  if (useMocks) {
    await delay();
    return [...mockConseillers];
  }
  return http<User[]>("/users?role=conseiller");
}

export async function createUser(input: Omit<User, "id" | "createdAt">): Promise<User> {
  if (useMocks) {
    await delay();
    const u: User = {
      ...input,
      id: `u-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    allUsers.push(u);
    return u;
  }
  return http<User>("/users", { method: "POST", json: input });
}

export async function updateUser(id: string, patch: Partial<User>): Promise<User> {
  if (useMocks) {
    await delay();
    const idx = allUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("Utilisateur introuvable");
    allUsers[idx] = { ...allUsers[idx], ...patch };
    return allUsers[idx];
  }
  return http<User>(`/users/${id}`, { method: "PATCH", json: patch });
}

export async function deleteUser(id: string): Promise<void> {
  if (useMocks) {
    await delay();
    const idx = allUsers.findIndex((u) => u.id === id);
    if (idx !== -1) allUsers.splice(idx, 1);
    return;
  }
  await http<void>(`/users/${id}`, { method: "DELETE" });
}
