import { openDb } from "./lib/db.mjs";

const db = await openDb();

async function insertIfMissing(table, slug, row, columns) {
  const existing = await db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug);
  if (existing) {
    console.log(`skip ${table}.${slug} (already exists)`);
    return;
  }
  const cols = columns.join(", ");
  const placeholders = columns.map((c) => `@${c}`).join(", ");
  await db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`).run(row);
  console.log(`inserted ${table}.${slug}`);
}

// ---------- New destinations ----------
const destinationColumns = [
  "slug",
  "name",
  "region",
  "description",
  "image",
  "highlights",
  "best_season",
  "distance_from_ooty",
];

const newDestinations = [
  {
    slug: "doddabetta-peak",
    name: "Doddabetta Peak",
    region: "The Nilgiris",
    description:
      "The highest point in the Nilgiris — a 360° telescope-house panorama over Ooty, Coonoor and the surrounding tea country.",
    image: "/images/attractions/doddabetta-peak.jpg",
    highlights: JSON.stringify(["Telescope house", "360° viewpoint", "Sunrise photography"]),
    best_season: "October to June",
    distance_from_ooty: "10 km",
  },
  {
    slug: "pykara-lake",
    name: "Pykara Lake & Falls",
    region: "The Nilgiris",
    description:
      "Pine-fringed waters, a golden-hour boat ride and a cascading waterfall — the Nilgiris' most cinematic drive.",
    image: "/images/attractions/pykara-lake.jpg",
    highlights: JSON.stringify(["Boating", "Pykara Falls", "Pine forest drive"]),
    best_season: "September to May",
    distance_from_ooty: "21 km",
  },
  {
    slug: "botanical-garden",
    name: "Government Botanical Garden",
    region: "Ooty",
    description:
      "Terraced Italian-style lawns, a 20-million-year-old fossil tree, and thousands of rare plant species in the heart of Ooty.",
    image: "/images/attractions/botanical-garden.jpg",
    highlights: JSON.stringify(["Fossil tree", "Annual flower show", "Terraced lawns"]),
    best_season: "Year-round",
    distance_from_ooty: "3 km",
  },
];

for (const d of newDestinations) {
  await insertIfMissing("destinations", d.slug, d, destinationColumns);
}

// ---------- New packages ----------
const packageColumns = [
  "slug",
  "name",
  "tagline",
  "summary",
  "description",
  "duration_label",
  "price_from",
  "hero_image",
  "category",
  "itinerary",
  "includes",
  "excludes",
  "faqs",
  "highlights",
];

const newPackages = [
  {
    slug: "ooty-sightseeing",
    name: "Ooty Sightseeing",
    tagline: "Every essential Ooty stop, in a single unhurried day",
    summary: "A full-day loop through Ooty Lake, the Botanical Garden, Doddabetta Peak and the Rose Garden.",
    description:
      "A private, chauffeur-driven day covering Ooty's must-see sights at a relaxed pace, with time built in for photographs at every stop.",
    duration_label: "1 Day",
    price_from: 3800,
    hero_image: "/images/destinations/ooty.jpg",
    category: "Family",
    itinerary: JSON.stringify([
      { day: 1, title: "Ooty in a day", description: "Ooty Lake, Government Botanical Garden, Doddabetta Peak, Rose Garden." },
    ]),
    includes: JSON.stringify(["Private chauffeur-driven vehicle", "All toll & parking fees"]),
    excludes: JSON.stringify(["Entry tickets at monuments", "Meals"]),
    faqs: JSON.stringify([{ question: "How many stops are included?", answer: "Four core Ooty sights, with flexibility to swap in others." }]),
    highlights: JSON.stringify(["Covers all Ooty essentials", "No early starts required"]),
  },
  {
    slug: "coonoor-ride",
    name: "Coonoor Ride",
    tagline: "A scenic day drive through Coonoor's viewpoints and tea gardens",
    summary: "Sim's Park, Lamb's Rock, Dolphin's Nose and a working tea estate, all in one day.",
    description:
      "A relaxed day trip along Coonoor's ridge roads — dramatic escarpment viewpoints, a working tea factory, and Sim's Park in between.",
    duration_label: "1 Day",
    price_from: 4100,
    hero_image: "/images/destinations/coonoor.jpg",
    category: "Friends",
    itinerary: JSON.stringify([
      { day: 1, title: "Coonoor ridge loop", description: "Sim's Park, Lamb's Rock, Dolphin's Nose, tea factory tour." },
    ]),
    includes: JSON.stringify(["Private vehicle", "All toll & parking fees"]),
    excludes: JSON.stringify(["Entry tickets", "Meals"]),
    faqs: JSON.stringify([{ question: "Is this a lot of walking?", answer: "Light walking only at each viewpoint — well-formed paths throughout." }]),
    highlights: JSON.stringify(["Two dramatic clifftop viewpoints", "Working tea factory stop"]),
  },
  {
    slug: "tea-estate-tour",
    name: "Tea Estate Tour",
    tagline: "Walk the gardens, watch the factory, taste the leaf",
    summary: "A half-day immersion in the Nilgiris' tea culture, from estate rows to the tasting counter.",
    description:
      "A guided half-day through a working tea estate — the picking rows, the withering and rolling floor, and a tasting of freshly graded Nilgiri tea.",
    duration_label: "Half Day",
    price_from: 3500,
    hero_image: "/images/attractions/tea-gardens.jpg",
    category: "Family",
    itinerary: JSON.stringify([
      { day: 1, title: "Tea estate half-day", description: "Estate walk, factory floor tour, tasting session." },
    ]),
    includes: JSON.stringify(["Private vehicle", "Factory tour & tasting"]),
    excludes: JSON.stringify(["Meals"]),
    faqs: JSON.stringify([{ question: "Can we buy tea on-site?", answer: "Yes, freshly packed estate tea is available for purchase after the tasting." }]),
    highlights: JSON.stringify(["Working factory floor tour", "Fresh tea tasting included"]),
  },
];

for (const p of newPackages) {
  await insertIfMissing("packages", p.slug, p, packageColumns);
}

// ---------- Backfill hero_image on existing packages missing one ----------
const heroImageBySlug = {
  "nilgiri-grand-circuit": "/images/attractions/nilgiris.jpg",
  "ooty-honeymoon-escape": "/images/destinations/avalanche-lake.jpg",
  "tea-trail-weekend": "/images/attractions/tea-factory-museum.jpg",
  "wildlife-waterfalls-expedition": "/images/destinations/mudumalai.jpg",
  "corporate-retreat-transfers": "/images/destinations/coimbatore.jpg",
  "airport-railway-transfers": "/images/destinations/coimbatore.jpg",
  "ooty-family-sightseeing-day": "/images/attractions/rose-garden.jpg",
  "pykara-lakeside-romance": "/images/attractions/pykara-lake.jpg",
  "avalanche-mudumalai-wild-trail": "/images/destinations/avalanche-lake.jpg",
  "coonoor-ridge-viewpoints-run": "/images/attractions/dolphins-nose.jpg",
};

const updateHero = db.prepare("UPDATE packages SET hero_image = ? WHERE slug = ? AND hero_image IS NULL");
for (const [slug, image] of Object.entries(heroImageBySlug)) {
  const result = await updateHero.run(image, slug);
  if (result.rowCount > 0) console.log(`set hero_image for ${slug}`);
}

await db.close();
console.log("Done.");
