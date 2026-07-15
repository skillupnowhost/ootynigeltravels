"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import {
  createUser,
  getUserByPhone,
  getUserById,
  updateUser,
  updateUserPassword,
  deleteUser,
  countByRole,
} from "@/lib/db/queries/users";
import { hashPassword } from "@/lib/auth/password";
import { recordAuditLog } from "@/lib/db/queries/auditLogs";

export type AdminActionState = { ok: boolean; error?: string };

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(20),
  role: z.enum(["admin", "manager", "staff"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createStaffUserAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const actor = await requireRole(["admin"]);

  const parsed = schema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  if (await getUserByPhone(parsed.data.phone)) {
    return { ok: false, error: "A user with this phone number already exists." };
  }

  const user = await createUser({
    role: parsed.data.role,
    name: parsed.data.name,
    phone: parsed.data.phone,
    passwordHash: hashPassword(parsed.data.password),
  });

  await recordAuditLog({
    actor_user_id: actor.id,
    actor_name: actor.name,
    action: "create",
    entity_type: "staff_user",
    entity_id: user.id,
    meta: { role: parsed.data.role },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

const updateStaffSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(20),
  role: z.enum(["admin", "manager", "staff"]),
  password: z.union([z.string().min(8, "Password must be at least 8 characters"), z.literal("")]),
});

export async function updateStaffUserAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const actor = await requireRole(["admin"]);

  const parsed = updateStaffSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const target = await getUserById(parsed.data.id);
  if (!target || target.role === "customer") return { ok: false, error: "User not found." };

  const existingByPhone = await getUserByPhone(parsed.data.phone);
  if (existingByPhone && existingByPhone.id !== target.id) {
    return { ok: false, error: "A user with this phone number already exists." };
  }

  if (target.role === "admin" && parsed.data.role !== "admin" && (await countByRole("admin")) <= 1) {
    return { ok: false, error: "Can't demote the last remaining admin." };
  }

  await updateUser(target.id, { name: parsed.data.name, phone: parsed.data.phone, role: parsed.data.role });
  if (parsed.data.password) {
    await updateUserPassword(target.id, hashPassword(parsed.data.password));
  }

  await recordAuditLog({
    actor_user_id: actor.id,
    actor_name: actor.name,
    action: "update",
    entity_type: "staff_user",
    entity_id: target.id,
    meta: { role: parsed.data.role },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteStaffUserAction(formData: FormData): Promise<void> {
  const actor = await requireRole(["admin"]);
  const id = Number(formData.get("id"));

  const target = await getUserById(id);
  if (!target || target.role === "customer") return;
  if (target.id === actor.id) return;
  if (target.role === "admin" && (await countByRole("admin")) <= 1) return;

  await deleteUser(id);
  await recordAuditLog({ actor_user_id: actor.id, actor_name: actor.name, action: "delete", entity_type: "staff_user", entity_id: id });
  revalidatePath("/admin/users");
}

const createCustomerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createCustomerAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const actor = await requireRole(["admin", "manager"]);

  const parsed = createCustomerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  if (await getUserByPhone(parsed.data.phone)) {
    return { ok: false, error: "A user with this phone number already exists." };
  }

  const customer = await createUser({
    role: "customer",
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    passwordHash: hashPassword(parsed.data.password),
  });

  await recordAuditLog({
    actor_user_id: actor.id,
    actor_name: actor.name,
    action: "create",
    entity_type: "customer",
    entity_id: customer.id,
  });
  revalidatePath("/admin/customers");
  return { ok: true };
}

const updateCustomerSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
});

export async function updateCustomerAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const actor = await requireRole(["admin", "manager"]);

  const parsed = updateCustomerSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const target = await getUserById(parsed.data.id);
  if (!target || target.role !== "customer") return { ok: false, error: "Customer not found." };

  const existingByPhone = await getUserByPhone(parsed.data.phone);
  if (existingByPhone && existingByPhone.id !== target.id) {
    return { ok: false, error: "A user with this phone number already exists." };
  }

  await updateUser(target.id, { name: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email || null });

  await recordAuditLog({
    actor_user_id: actor.id,
    actor_name: actor.name,
    action: "update",
    entity_type: "customer",
    entity_id: target.id,
  });
  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function deleteCustomerAction(formData: FormData): Promise<void> {
  const actor = await requireRole(["admin", "manager"]);
  const id = Number(formData.get("id"));

  const target = await getUserById(id);
  if (!target || target.role !== "customer") return;

  await deleteUser(id);
  await recordAuditLog({ actor_user_id: actor.id, actor_name: actor.name, action: "delete", entity_type: "customer", entity_id: id });
  revalidatePath("/admin/customers");
}
