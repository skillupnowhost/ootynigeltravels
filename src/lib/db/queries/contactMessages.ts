import { db } from "../client";
import type { ContactMessage } from "../types";

export async function listContactMessages(): Promise<ContactMessage[]> {
  return (await db
    .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC")
    .all()) as ContactMessage[];
}

export async function createContactMessage(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string;
}): Promise<ContactMessage> {
  return (await db
    .prepare(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES (@name, @email, @phone, @subject, @message)
       RETURNING *`
    )
    .get({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      subject: input.subject ?? null,
      message: input.message,
    })) as ContactMessage;
}

export async function setMessageHandled(id: number, handled: boolean): Promise<void> {
  await db.prepare("UPDATE contact_messages SET handled = ? WHERE id = ?").run(
    handled ? 1 : 0,
    id
  );
}

export async function deleteContactMessage(id: number): Promise<void> {
  await db.prepare("DELETE FROM contact_messages WHERE id = ?").run(id);
}
