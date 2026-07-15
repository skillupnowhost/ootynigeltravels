import fs from "node:fs";
import path from "node:path";
import { DB_PATH, ROOT } from "./lib/db.mjs";

const backupDir = path.join(ROOT, "data", "backups");
fs.mkdirSync(backupDir, { recursive: true });

if (!fs.existsSync(DB_PATH)) {
  console.error("No database found at data/ooty.db — run `npm run db:migrate` first.");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dest = path.join(backupDir, `ooty-${stamp}.db`);
fs.copyFileSync(DB_PATH, dest);
console.log(`Backup written to ${path.relative(ROOT, dest)}`);
