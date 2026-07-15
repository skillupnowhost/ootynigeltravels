import crypto from "node:crypto";
import { db } from "../client";
import type { Session } from "../types";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function createSession(userId: number): { rawToken: string; expiresAt: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.prepare(
    `INSERT INTO sessions (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)`
  ).run(id, hashToken(rawToken), userId, expiresAt);
  return { rawToken, expiresAt };
}

export function getSessionByRawToken(rawToken: string): Session | undefined {
  const tokenHash = hashToken(rawToken);
  const session = db
    .prepare("SELECT * FROM sessions WHERE token_hash = ?")
    .get(tokenHash) as Session | undefined;
  if (!session) return undefined;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(session.id);
    return undefined;
  }
  return session;
}

export function deleteSessionByRawToken(rawToken: string): void {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(
    hashToken(rawToken)
  );
}

export function deleteExpiredSessions(): void {
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(
    new Date().toISOString()
  );
}
