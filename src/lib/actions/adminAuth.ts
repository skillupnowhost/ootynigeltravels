"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUserByPhone } from "@/lib/db/queries/users";
import { verifyPassword } from "@/lib/auth/password";
import { establishSession, destroySession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rateLimit";
import { STAFF_ROLES } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/db/queries/auditLogs";

export type AuthFormState = { ok: boolean; error?: string };

const schema = z.object({
  phone: z.string().trim().min(6).max(20),
  password: z.string().min(1),
});

export async function adminLoginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const store = await headers();
  if (!rateLimit(`admin-login:${store.get("x-forwarded-for") ?? "local"}`, 10, 60_000)) {
    return { ok: false, error: "Too many attempts — please wait a minute and try again." };
  }

  const parsed = schema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Enter your phone number and password." };

  const user = getUserByPhone(parsed.data.phone);
  if (!user || !STAFF_ROLES.includes(user.role) || !verifyPassword(parsed.data.password, user.password_hash)) {
    return { ok: false, error: "Invalid credentials." };
  }

  await establishSession(user.id);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "login",
    entity_type: "session",
  });
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
