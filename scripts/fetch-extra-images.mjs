// One-off, manually-run script — mirrors scripts/fetch-package-images.mjs's
// download pipeline for two extra image sets the homepage redesign needs:
//   1. public/images/trip-styles/<key>.jpg — people-in-frame photos for the
//      "Choose Your Trip Style" cards (the package-category photos are scenery-only).
//   2. public/images/destinations/<slug>.jpg — photos for two destinations
//      (Ooty Lake, Pine Forest) newly added to the destinations table.
//
//   node scripts/fetch-extra-images.mjs
//
// Requires UNSPLASH_ACCESS_KEY in .env.local (same key fetch-package-images.mjs uses).

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

try {
  process.loadEnvFile(path.join(ROOT, ".env.local"));
} catch {
  // .env.local may already be loaded into the environment some other way
}

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY || ACCESS_KEY === "change-me") {
  console.error("UNSPLASH_ACCESS_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const UTM = "utm_source=ooty-nigel-travels&utm_medium=referral";

const TRIP_STYLE_QUERIES = {
  Family: "family vacation smiling hill station",
  Honeymoon: "couple honeymoon travel hills sunset",
  Adventure: "friends hiking adventure trail forest",
  Friends: "friends group travel viewpoint laughing",
  Customized: "travel planning couple map itinerary",
};

const DESTINATION_QUERIES = {
  "ooty-lake": "ooty lake boating india",
  "pine-forest": "pine forest misty hills india",
};

const ATTRACTION_QUERIES = {
  "nilgiri-mountain-railway": "nilgiri mountain railway toy train india",
  "sims-park": "botanical park hill station india terraced garden",
  "kodanad-viewpoint": "mountain viewpoint valley india sunrise",
  "elk-falls": "waterfall forest india cascade",
};

async function searchPhoto(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=landscape&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } });
  if (!res.ok) throw new Error(`Unsplash search failed for "${query}": ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.results?.[0] ?? null;
}

async function trackDownload(photo) {
  try {
    await fetch(`${photo.links.download_location}&client_id=${ACCESS_KEY}`);
  } catch {
    // non-fatal
  }
}

async function downloadImage(photo, destPath) {
  const src = `${photo.urls.raw}&w=1600&q=80&fm=jpg&fit=crop`;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Download failed for ${photo.id}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
}

async function fetchSet(queries, outDir, credits) {
  await fs.mkdir(outDir, { recursive: true });
  for (const [key, query] of Object.entries(queries)) {
    const destPath = path.join(outDir, `${key}.jpg`);
    const exists = await fs
      .stat(destPath)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      console.log(`Skipping "${key}" — already exists`);
      continue;
    }
    console.log(`Fetching "${key}" — query: ${query}`);
    const photo = await searchPhoto(query);
    if (!photo) {
      console.warn(`  no results for ${key}, skipping`);
      continue;
    }
    await downloadImage(photo, destPath);
    await trackDownload(photo);
    credits.push(
      `- \`${path.relative(path.join(ROOT, "public"), destPath).replace(/\\/g, "/")}\` — Photo by [${photo.user.name}](${photo.user.links.html}?${UTM}) on [Unsplash](${photo.links.html}?${UTM})`
    );
    console.log(`  saved ${destPath}`);
  }
}

async function main() {
  const credits = ["# Extra photography credits\n\nPhotos via the Unsplash API. Do not remove attribution.\n"];

  await fetchSet(TRIP_STYLE_QUERIES, path.join(ROOT, "public", "images", "trip-styles"), credits);
  await fetchSet(DESTINATION_QUERIES, path.join(ROOT, "public", "images", "destinations"), credits);
  await fetchSet(ATTRACTION_QUERIES, path.join(ROOT, "public", "images", "attractions"), credits);

  const creditsPath = path.join(ROOT, "public", "images", "EXTRA_IMAGE_CREDITS.md");
  const prev = await fs.readFile(creditsPath, "utf8").catch(() => "");
  await fs.writeFile(creditsPath, prev + credits.join("\n") + "\n", "utf8");
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
