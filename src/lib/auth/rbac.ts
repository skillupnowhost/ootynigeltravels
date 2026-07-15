import { redirect } from "next/navigation";
import { getCurrentUser, STAFF_ROLES } from "./session";
import type { User, UserRole } from "../db/types";

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<User> {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    redirect("/admin/login");
  }
  return user;
}

export async function requireStaff(): Promise<User> {
  return requireRole(STAFF_ROLES);
}

export async function requireAdmin(): Promise<User> {
  return requireRole(["admin"]);
}
