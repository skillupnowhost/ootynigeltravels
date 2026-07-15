import { openDb } from "./lib/db.mjs";
import { hashPassword } from "./lib/password.mjs";

// Usage:
//   node scripts/create-admin.mjs --name "Jane Doe" --phone 9876543210 --password "strongpass" --role manager
const args = process.argv.slice(2);
function getArg(flag, fallback) {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : fallback;
}

const name = getArg("--name");
const phone = getArg("--phone");
const password = getArg("--password");
const role = getArg("--role", "staff");

if (!name || !phone || !password) {
  console.error(
    'Usage: node scripts/create-admin.mjs --name "Jane Doe" --phone 9876543210 --password "strongpass" --role staff|manager|admin'
  );
  process.exit(1);
}

if (!["admin", "manager", "staff"].includes(role)) {
  console.error("--role must be one of: admin, manager, staff");
  process.exit(1);
}

const db = await openDb();
const existing = await db.prepare("SELECT id FROM users WHERE phone = ?").get(phone);
if (existing) {
  console.error(`A user with phone ${phone} already exists (id ${existing.id}).`);
  await db.close();
  process.exit(1);
}

const hash = hashPassword(password);
const created = await db
  .prepare(
    "INSERT INTO users (role, name, phone, password_hash) VALUES (?, ?, ?, ?) RETURNING *"
  )
  .get(role, name, phone, hash);

console.log(`Created ${role} user "${name}" (id ${created.id}, phone ${phone}).`);
await db.close();
