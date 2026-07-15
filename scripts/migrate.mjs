import fs from "node:fs";
import path from "node:path";
import { openDb, ROOT } from "./lib/db.mjs";

fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });

const schemaPath = path.join(ROOT, "src", "lib", "db", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

const db = openDb();
db.exec(schema);

// CREATE TABLE IF NOT EXISTS above won't add columns to an already-existing
// bookings table, so new columns need an explicit additive check.
const bookingColumns = new Set(
  db.prepare("PRAGMA table_info(bookings)").all().map((c) => c.name)
);
if (!bookingColumns.has("destination")) {
  db.exec("ALTER TABLE bookings ADD COLUMN destination TEXT");
  console.log("added column bookings.destination");
}
if (!bookingColumns.has("end_date")) {
  db.exec("ALTER TABLE bookings ADD COLUMN end_date TEXT");
  console.log("added column bookings.end_date");
}
if (!bookingColumns.has("itinerary")) {
  db.exec("ALTER TABLE bookings ADD COLUMN itinerary TEXT NOT NULL DEFAULT '[]'");
  console.log("added column bookings.itinerary");
}

const packageColumns = new Set(
  db.prepare("PRAGMA table_info(packages)").all().map((c) => c.name)
);
const newPackageColumns = {
  gallery: "TEXT NOT NULL DEFAULT '[]'",
  original_price: "INTEGER",
  rating: "REAL NOT NULL DEFAULT 4.8",
  review_count: "INTEGER NOT NULL DEFAULT 0",
  vehicle_options: "TEXT NOT NULL DEFAULT '[]'",
  max_group_size: "INTEGER",
  duration_days: "INTEGER",
  distance_label: "TEXT",
  pickup_drop: "TEXT",
  driver_info: "TEXT",
  best_time: "TEXT",
  places_covered: "TEXT NOT NULL DEFAULT '[]'",
};
for (const [column, def] of Object.entries(newPackageColumns)) {
  if (!packageColumns.has(column)) {
    db.exec(`ALTER TABLE packages ADD COLUMN ${column} ${def}`);
    console.log(`added column packages.${column}`);
  }
}

const tripRequestColumns = new Set(
  db.prepare("PRAGMA table_info(trip_requests)").all().map((c) => c.name)
);
const newTripRequestColumns = {
  package_slug: "TEXT",
  vehicle_type: "TEXT",
  hotel_category: "TEXT",
  computed_total: "INTEGER",
};
for (const [column, def] of Object.entries(newTripRequestColumns)) {
  if (!tripRequestColumns.has(column)) {
    db.exec(`ALTER TABLE trip_requests ADD COLUMN ${column} ${def}`);
    console.log(`added column trip_requests.${column}`);
  }
}

const destinationColumns = new Set(
  db.prepare("PRAGMA table_info(destinations)").all().map((c) => c.name)
);
if (!destinationColumns.has("sort_order")) {
  db.exec("ALTER TABLE destinations ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0");
  console.log("added column destinations.sort_order");
}

const blogPostColumns = new Set(
  db.prepare("PRAGMA table_info(blog_posts)").all().map((c) => c.name)
);
if (!blogPostColumns.has("category")) {
  db.exec("ALTER TABLE blog_posts ADD COLUMN category TEXT NOT NULL DEFAULT 'Guides'");
  console.log("added column blog_posts.category");
}

db.close();

console.log("Database schema is up to date at data/ooty.db");
