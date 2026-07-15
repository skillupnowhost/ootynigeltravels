import { Pool, types, type PoolClient } from "pg";

// Postgres OID 1082 = date, 1184 = timestamptz. Override the default parsers so
// rows keep flowing through the app as plain strings, exactly like the old
// SQLite TEXT columns did — callers never have to deal with JS Date objects
// (and the local-timezone shift that pg's default `date` parser introduces).
types.setTypeParser(1082, (value: string) => value);
types.setTypeParser(1184, (value: string) => new Date(value).toISOString());

// OID 20 = bigint (COUNT(*) results), 1700 = numeric (SUM/AVG results). Both
// come back from pg as strings by default to avoid silent precision loss on
// huge values; every count/sum/average in this app is small enough that a
// plain JS number (matching what node:sqlite used to return) is correct.
types.setTypeParser(20, (value: string) => parseInt(value, 10));
types.setTypeParser(1700, (value: string) => parseFloat(value));

const CONNECTION_STRING = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!CONNECTION_STRING) {
  throw new Error(
    "Set POSTGRES_URL (or DATABASE_URL) to your Postgres connection string."
  );
}

interface RunResult {
  rowCount: number;
}

export interface WrappedStatement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(...params: any[]): Promise<RunResult>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(...params: any[]): Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all(...params: any[]): Promise<any>;
}

export interface WrappedDb {
  exec(sql: string): Promise<void>;
  prepare(sql: string): WrappedStatement;
}

type Placeholders =
  | { kind: "none" }
  | { kind: "positional" }
  | { kind: "named"; names: string[] };

// Blanks out the contents of single-quoted string literals (preserving length
// and the quote characters themselves) so the placeholder scanner below never
// mistakes an `@`/`?` inside literal data — e.g. a hardcoded email address —
// for a bind parameter. A doubled `''` (SQL's escaped quote) still round-trips
// correctly since each `'` just toggles the in-string flag.
function maskStringLiterals(sql: string): string {
  let out = "";
  let inString = false;
  for (const ch of sql) {
    if (ch === "'") {
      inString = !inString;
      out += ch;
    } else {
      out += inString ? "\0" : ch;
    }
  }
  return out;
}

// Query files write SQLite-style `?` and `@col` placeholders (never mixed in
// the same statement). Translate those to Postgres `$1, $2, ...` once per
// prepared statement so the query files themselves didn't need rewriting.
function parsePlaceholders(sql: string): { text: string; placeholders: Placeholders } {
  const masked = maskStringLiterals(sql);
  const names: string[] = [];
  let text = "";
  let lastIndex = 0;

  const namedRegex = /@(\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = namedRegex.exec(masked))) {
    names.push(match[1]);
    text += sql.slice(lastIndex, match.index) + `$${names.length}`;
    lastIndex = match.index + match[0].length;
  }
  if (names.length > 0) {
    return { text: text + sql.slice(lastIndex), placeholders: { kind: "named", names } };
  }

  let count = 0;
  text = "";
  lastIndex = 0;
  const positionalRegex = /\?/g;
  while ((match = positionalRegex.exec(masked))) {
    count += 1;
    text += sql.slice(lastIndex, match.index) + `$${count}`;
    lastIndex = match.index + match[0].length;
  }
  if (count > 0) {
    return { text: text + sql.slice(lastIndex), placeholders: { kind: "positional" } };
  }

  return { text: sql, placeholders: { kind: "none" } };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bindArgs(placeholders: Placeholders, args: any[]): any[] {
  if (placeholders.kind === "named") {
    const obj = (args[0] as Record<string, unknown>) ?? {};
    return placeholders.names.map((name) => obj[name] ?? null);
  }
  if (placeholders.kind === "none") {
    // Callers sometimes still pass an argument (e.g. an empty filters
    // object) even when the SQL has no placeholders at all — pg rejects
    // any values array when the statement expects zero parameters.
    return [];
  }
  return args;
}

interface Queryable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query(text: string, values?: any[]): Promise<{ rows: any[]; rowCount: number | null }>;
}

function wrapQueryable(client: Queryable): WrappedDb {
  return {
    exec: async (sql) => {
      await client.query(sql);
    },
    prepare: (sql) => {
      const { text, placeholders } = parsePlaceholders(sql);
      return {
        run: async (...params) => {
          const res = await client.query(text, bindArgs(placeholders, params));
          return { rowCount: res.rowCount ?? 0 };
        },
        get: async (...params) => {
          const res = await client.query(text, bindArgs(placeholders, params));
          return res.rows[0];
        },
        all: async (...params) => {
          const res = await client.query(text, bindArgs(placeholders, params));
          return res.rows;
        },
      };
    },
  };
}

declare global {
  var __ootyPool: Pool | undefined;
}

const pool =
  globalThis.__ootyPool ??
  new Pool({
    connectionString: CONNECTION_STRING,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__ootyPool = pool;
}

export const db: WrappedDb = wrapQueryable(pool);

// Checks out a single connection and runs `fn` inside BEGIN/COMMIT so
// multi-statement flows (reorders, booking + history insert) stay atomic.
export async function withTransaction<T>(fn: (tx: WrappedDb) => Promise<T>): Promise<T> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(wrapQueryable(client));
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
