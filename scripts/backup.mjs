import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ROOT } from "./lib/db.mjs";

const execFileAsync = promisify(execFile);

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set POSTGRES_URL (or DATABASE_URL) to your Postgres connection string.");
  process.exit(1);
}

const backupDir = path.join(ROOT, "data", "backups");
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dest = path.join(backupDir, `ooty-${stamp}.sql`);

try {
  await execFileAsync("pg_dump", [connectionString, "-f", dest]);
  console.log(`Backup written to ${path.relative(ROOT, dest)}`);
} catch (err) {
  console.error(
    "pg_dump failed — install the Postgres client tools locally, or use your provider's built-in backups/branching (e.g. Neon's point-in-time restore) instead."
  );
  console.error(err.message);
  process.exit(1);
}
