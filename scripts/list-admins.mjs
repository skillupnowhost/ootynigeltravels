import { openDb } from "./lib/db.mjs";

// Lists admin/manager/staff accounts (no passwords)
// Usage: node scripts/list-admins.mjs

const db = await openDb();
try {
  const rows = await db.prepare(
    "SELECT id, role, name, phone, created_at FROM users WHERE role IN ('admin','manager','staff') ORDER BY id"
  ).all();

  if (!rows || rows.length === 0) {
    console.log("No admin users found.");
  } else {
    console.log("id\trole\tname\tphone\tcreated_at");
    for (const r of rows) {
      console.log(`${r.id}\t${r.role}\t${r.name}\t${r.phone}\t${r.created_at ?? ''}`);
    }
  }
} finally {
  await db.close();
}
