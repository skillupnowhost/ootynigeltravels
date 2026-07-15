import { db } from "../client";
import type { ContactMessage } from "../types";

export function listContactMessages(): ContactMessage[] {
  return db
    .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC")
    .all() as ContactMessage[];
}

export function createContactMessage(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string;
}): ContactMessage {
  const result = db
    .prepare(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES (@name, @email, @phone, @subject, @message)`
    )
    .run({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      subject: input.subject ?? null,
      message: input.message,
    });
  return db
    .prepare("SELECT * FROM contact_messages WHERE id = ?")
    .get(Number(result.lastInsertRowid)) as ContactMessage;
}

export function setMessageHandled(id: number, handled: boolean): void {
  db.prepare("UPDATE contact_messages SET handled = ? WHERE id = ?").run(
    handled ? 1 : 0,
    id
  );
}

export function deleteContactMessage(id: number): void {
  db.prepare("DELETE FROM contact_messages WHERE id = ?").run(id);
}
