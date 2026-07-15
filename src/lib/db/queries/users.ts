import { db } from "../client";
import type { User, UserRole } from "../types";

export async function getUserByPhone(phone: string): Promise<User | undefined> {
  return (await db.prepare("SELECT * FROM users WHERE phone = ?").get(phone)) as
    | User
    | undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  return (await db.prepare("SELECT * FROM users WHERE id = ?").get(id)) as
    | User
    | undefined;
}

export async function createUser(input: {
  role: UserRole;
  name: string;
  phone: string;
  email?: string | null;
  passwordHash: string;
}): Promise<User> {
  return (await db
    .prepare(
      `INSERT INTO users (role, name, phone, email, password_hash) VALUES (?, ?, ?, ?, ?) RETURNING *`
    )
    .get(
      input.role,
      input.name,
      input.phone,
      input.email ?? null,
      input.passwordHash
    )) as User;
}

export async function listStaffUsers(): Promise<User[]> {
  return (await db
    .prepare(
      "SELECT * FROM users WHERE role IN ('admin','manager','staff') ORDER BY created_at DESC"
    )
    .all()) as User[];
}

export async function listCustomers(): Promise<User[]> {
  return (await db
    .prepare("SELECT * FROM users WHERE role = 'customer' ORDER BY created_at DESC")
    .all()) as User[];
}

export async function countByRole(role: UserRole): Promise<number> {
  const row = (await db
    .prepare("SELECT COUNT(*) as c FROM users WHERE role = ?")
    .get(role)) as { c: number };
  return row.c;
}

export async function updateUserPassword(id: number, passwordHash: string): Promise<void> {
  await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    id
  );
}

export async function updateUser(
  id: number,
  fields: { name: string; phone: string; email?: string | null; role?: UserRole }
): Promise<void> {
  if (fields.role) {
    await db.prepare("UPDATE users SET name = ?, phone = ?, email = ?, role = ? WHERE id = ?").run(
      fields.name,
      fields.phone,
      fields.email ?? null,
      fields.role,
      id
    );
  } else {
    await db.prepare("UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?").run(
      fields.name,
      fields.phone,
      fields.email ?? null,
      id
    );
  }
}

export async function updateUserAvatar(id: number, avatar: string): Promise<void> {
  await db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatar, id);
}

export async function deleteUser(id: number): Promise<void> {
  await db.prepare("DELETE FROM users WHERE id = ?").run(id);
}
