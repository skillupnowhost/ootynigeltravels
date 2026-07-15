"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUserByPhone, createUser } from "@/lib/db/queries/users";
import { linkBookingsToCustomer } from "@/lib/db/queries/bookings";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { establishSession, destroySession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rateLimit";

export type AuthFormState = { ok: boolean; error?: string };

const loginSchema = z.object({
  phone: z.string().trim().min(6).max(20),
  password: z.string().min(1),
});

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const store = await headers();
  if (!rateLimit(`login:${store.get("x-forwarded-for") ?? "local"}`, 10, 60_000)) {
    return { ok: false, error: "Too many attempts — please wait a minute and try again." };
  }

  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Enter your phone number and password." };

  const user = await getUserByPhone(parsed.data.phone);
  if (!user || user.role !== "customer" || !verifyPassword(parsed.data.password, user.password_hash)) {
    return { ok: false, error: "Invalid phone number or password." };
  }

  await establishSession(user.id);
  redirect("/account");
}

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\-\s]{7,20}$/, "Enter a valid phone number"),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const store = await headers();
  if (!rateLimit(`register:${store.get("x-forwarded-for") ?? "local"}`, 6, 60_000)) {
    return { ok: false, error: "Too many attempts — please wait a minute and try again." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const existing = await getUserByPhone(parsed.data.phone);
  if (existing) {
    return { ok: false, error: "An account with this phone number already exists." };
  }

  const user = await createUser({
    role: "customer",
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    passwordHash: hashPassword(parsed.data.password),
  });

  // Guest bookings made with this phone number before signing up now show
  // up in the account dashboard — no OTP verification, matched by phone.
  await linkBookingsToCustomer(parsed.data.phone, user.id);

  await establishSession(user.id);
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/account/login");
}
