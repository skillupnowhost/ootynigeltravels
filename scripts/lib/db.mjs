import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Client, types } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..");

try {
  process.loadEnvFile(path.join(ROOT, ".env.local"));
} catch {
  // .env.local may not exist (CI/production env vars are set another way)
}

// Mirrors src/lib/db/client.ts's type-parser overrides — see that file for
// why: pg's defaults for date/timestamptz/bigint/numeric don't match what
// the rest of this codebase (and these scripts) expect.
types.setTypeParser(1082, (value) => value);
types.setTypeParser(1184, (value) => new Date(value).toISOString());
types.setTypeParser(20, (value) => parseInt(value, 10));
types.setTypeParser(1700, (value) => parseFloat(value));

// See src/lib/db/client.ts's parsePlaceholders for why literals are masked
// before scanning: a literal `@`/`?` inside string data (e.g. an email
// address) must never be mistaken for a bind parameter.
function maskStringLiterals(sql) {
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

function parsePlaceholders(sql) {
  const masked = maskStringLiterals(sql);
  const names = [];
  let text = "";
  let lastIndex = 0;

  const namedRegex = /@(\w+)/g;
  let match;
  while ((match = namedRegex.exec(masked))) {
    names.push(match[1]);
    text += sql.slice(lastIndex, match.index) + `$${names.length}`;
    lastIndex = match.index + match[0].length;
  }
  if (names.length > 0) {
    return { text: text + sql.slice(lastIndex), kind: "named", names };
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
    return { text: text + sql.slice(lastIndex), kind: "positional" };
  }

  return { text: sql, kind: "none" };
}

function bindArgs(placeholders, args) {
  if (placeholders.kind === "named") {
    const obj = args[0] ?? {};
    return placeholders.names.map((name) => obj[name] ?? null);
  }
  if (placeholders.kind === "none") {
    return [];
  }
  return args;
}

// Scripts run their statements sequentially on one session (some, like
// seed.mjs, use SAVEPOINT/ROLLBACK TO for atomicity) so this uses a single
// pg.Client rather than a Pool — a Pool could hand different statements to
// different physical connections, silently breaking that transaction state.
export async function openDb() {
  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set POSTGRES_URL (or DATABASE_URL) to your Postgres connection string.");
  }
  const client = new Client({
    connectionString,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
  });
  await client.connect();

  return {
    async exec(sql) {
      await client.query(sql);
    },
    prepare(sql) {
      const { text, ...placeholders } = parsePlaceholders(sql);
      return {
        async run(...args) {
          const res = await client.query(text, bindArgs(placeholders, args));
          return { rowCount: res.rowCount ?? 0 };
        },
        async get(...args) {
          const res = await client.query(text, bindArgs(placeholders, args));
          return res.rows[0];
        },
        async all(...args) {
          const res = await client.query(text, bindArgs(placeholders, args));
          return res.rows;
        },
      };
    },
    async close() {
      await client.end();
    },
  };
}
