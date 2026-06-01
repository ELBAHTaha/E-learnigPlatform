import { delay, http, useMocks } from "@/lib/httpClient";
import { allUsers, demoAccounts } from "@/mocks/users";
import type { User } from "@/types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

export async function login(input: LoginInput): Promise<LoginResult> {
  if (useMocks) {
    await delay(400);
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase()
    );
    if (!user) {
      throw new Error("Identifiants incorrects.");
    }
    return { user, token: `mock.${user.id}.${Date.now()}` };
  }
  return http<LoginResult>("/auth/login", { method: "POST", json: input });
}

export async function loginAsDemo(role: "admin" | "formateur" | "eleve" | "conseiller"): Promise<LoginResult> {
  const account = demoAccounts.find((d) => d.role === role);
  if (!account) throw new Error("Compte démo introuvable.");
  return login({ email: account.email, password: "demo" });
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone?: string;
  city?: string;
  interestedPole?: string;
}

export async function register(input: RegisterInput): Promise<LoginResult> {
  if (useMocks) {
    await delay(500);
    const exists = allUsers.find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase()
    );
    if (exists) throw new Error("Un compte existe déjà avec cet email.");
    const user: User = {
      id: `u-eleve-new-${Date.now()}`,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: "eleve",
      phone: input.phone,
      city: input.city,
      createdAt: new Date().toISOString(),
      active: true,
    };
    allUsers.push(user);
    return { user, token: `mock.${user.id}.${Date.now()}` };
  }
  const { passwordConfirmation, ...rest } = input;
  return http<LoginResult>("/auth/register", {
    method: "POST",
    // Laravel's `confirmed` rule requires the snake_case `password_confirmation`.
    json: { ...rest, password_confirmation: passwordConfirmation },
  });
}
