import crypto from "node:crypto";
import { openDb } from "./lib/db.mjs";
import { hashPassword } from "./lib/password.mjs";

const phone = process.argv[2] ?? "9000000000";
const password = process.argv[3] ?? "OotyNigel@" + crypto.randomBytes(4).toString("hex");

const db = openDb();
const user = db.prepare("SELECT id, name, role FROM users WHERE phone = ?").get(phone);
if (!user) {
  console.error(`No user found with phone ${phone}.`);
  db.close();
  process.exit(1);
}

const hash = hashPassword(password);
db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, user.id);

console.log(`Password reset for ${user.name} (${user.role}).`);
console.log(`  Phone:    ${phone}`);
console.log(`  Password: ${password}`);
console.log("  Sign in at /admin/login — change this password after first login.");
db.close();
