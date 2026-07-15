import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "ooty.db");

// node:sqlite returns rows as null-prototype objects, which React rejects
// when a Server Component passes them straight into a Client Component
// ("Classes or null prototypes are not supported"). Every statement is
// wrapped here so callers always get plain objects back, once, instead of
// patching every query file individually.
function toPlain<T>(row: T): T {
  if (row && typeof row === "object") {
    return { ...(row as object) } as T;
  }
  return row;
}

interface RunResult {
  changes: number | bigint;
  lastInsertRowid: number | bigint;
}

export interface WrappedStatement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(...params: any[]): RunResult;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(...params: any[]): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all(...params: any[]): any;
}

export interface WrappedDb {
  exec(sql: string): void;
  prepare(sql: string): WrappedStatement;
}

function wrapDb(raw: DatabaseSync): WrappedDb {
  return {
    exec: (sql) => raw.exec(sql),
    prepare: (sql) => {
      const stmt = raw.prepare(sql);
      return {
        run: (...params) => stmt.run(...params),
        get: (...params) => toPlain(stmt.get(...params)),
        all: (...params) => (stmt.all(...params) as unknown[]).map(toPlain),
      };
    },
  };
}

declare global {
  var __ootyDb: WrappedDb | undefined;
}

function openDb(): WrappedDb {
  const raw = new DatabaseSync(DB_PATH, { enableForeignKeyConstraints: true });
  raw.exec("PRAGMA journal_mode = WAL;");
  raw.exec("PRAGMA foreign_keys = ON;");
  return wrapDb(raw);
}

export const db: WrappedDb = globalThis.__ootyDb ?? openDb();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ootyDb = db;
}
