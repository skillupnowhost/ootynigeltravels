import { cookies } from "next/headers";
import { createSession, deleteSessionByRawToken, getSessionByRawToken } from "../db/queries/sessions";
import { getUserById } from "../db/queries/users";
import type { User, UserRole } from "../db/types";

export const SESSION_COOKIE = "ooty_session";

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const session = await getSessionByRawToken(raw);
  if (!session) return null;
  const user = await getUserById(session.user_id);
  return user ?? null;
}

export async function establishSession(userId: number): Promise<void> {
  const { rawToken, expiresAt } = await createSession(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (raw) await deleteSessionByRawToken(raw);
  store.delete(SESSION_COOKIE);
}

export function hasRole(user: User | null, roles: UserRole[]): boolean {
  return !!user && roles.includes(user.role);
}

export const STAFF_ROLES: UserRole[] = ["admin", "manager", "staff"];
