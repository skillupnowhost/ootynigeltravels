import fs from "node:fs";
import path from "node:path";
import { openDb, ROOT } from "./lib/db.mjs";

const schemaPath = path.join(ROOT, "src", "lib", "db", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

const db = await openDb();
await db.exec(schema);
await db.close();

console.log("Database schema is up to date.");
