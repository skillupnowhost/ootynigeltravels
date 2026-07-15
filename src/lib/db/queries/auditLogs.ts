import { db } from "../client";
import type { AuditLog } from "../types";

export async function recordAuditLog(input: {
  actor_user_id: number | null;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | number | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  await db.prepare(
    `INSERT INTO audit_logs (actor_user_id, actor_name, action, entity_type, entity_id, meta)
     VALUES (@actor_user_id, @actor_name, @action, @entity_type, @entity_id, @meta)`
  ).run({
    actor_user_id: input.actor_user_id,
    actor_name: input.actor_name,
    action: input.action,
    entity_type: input.entity_type,
    entity_id: input.entity_id != null ? String(input.entity_id) : null,
    meta: input.meta ? JSON.stringify(input.meta) : null,
  });
}

export async function listAuditLogs(limit = 200): Promise<AuditLog[]> {
  return (await db
    .prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?")
    .all(limit)) as AuditLog[];
}
