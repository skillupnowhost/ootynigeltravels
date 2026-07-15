import { db } from "../client";
import type { User, UserRole } from "../types";

export function getUserByPhone(phone: string): User | undefined {
  return db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) as
    | User
    | undefined;
}

export function getUserById(id: number): User | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | User
    | undefined;
}

export function createUser(input: {
  role: UserRole;
  name: string;
  phone: string;
  email?: string | null;
  passwordHash: string;
}): User {
  const result = db
    .prepare(
      `INSERT INTO users (role, name, phone, email, password_hash) VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      input.role,
      input.name,
      input.phone,
      input.email ?? null,
      input.passwordHash
    );
  return getUserById(Number(result.lastInsertRowid))!;
}

export function listStaffUsers(): User[] {
  return db
    .prepare(
      "SELECT * FROM users WHERE role IN ('admin','manager','staff') ORDER BY created_at DESC"
    )
    .all() as User[];
}

export function listCustomers(): User[] {
  return db
    .prepare("SELECT * FROM users WHERE role = 'customer' ORDER BY created_at DESC")
    .all() as User[];
}

export function countByRole(role: UserRole): number {
  const row = db
    .prepare("SELECT COUNT(*) as c FROM users WHERE role = ?")
    .get(role) as { c: number };
  return row.c;
}

export function updateUserPassword(id: number, passwordHash: string): void {
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    id
  );
}

export function updateUser(
  id: number,
  fields: { name: string; phone: string; email?: string | null; role?: UserRole }
): void {
  if (fields.role) {
    db.prepare("UPDATE users SET name = ?, phone = ?, email = ?, role = ? WHERE id = ?").run(
      fields.name,
      fields.phone,
      fields.email ?? null,
      fields.role,
      id
    );
  } else {
    db.prepare("UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?").run(
      fields.name,
      fields.phone,
      fields.email ?? null,
      id
    );
  }
}

export function deleteUser(id: number): void {
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
}
