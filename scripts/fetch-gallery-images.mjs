// One-off, manually-run script — mirrors scripts/fetch-extra-images.mjs's
// download pipeline to source real photography for the redesigned Gallery
// page's categories that have no existing usable assets under public/images/.
//
//   node scripts/fetch-gallery-images.mjs
//
// Saves to public/images/gallery/<category-slug>/<n>.jpg (numbered per query).
// Requires UNSPLASH_ACCESS_KEY in .env.local (same key the other fetch-*
// scripts use). Safe to re-run — already-downloaded files are skipped.

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

// category-slug -> ordered list of distinct search queries (one photo each).
// Only categories with no adequate existing real photography are listed here
// — Ooty/Coonoor/Kotagiri/Avalanche/Pykara/Doddabetta/Lakes/Forest/Vehicles/
// Customer Memories are covered by existing destinations/attractions/fleet
// assets (and the copied Client Car photos) and don't need fresh downloads.
const GALLERY_QUERIES = {
  wildlife: [
    "indian elephant wildlife forest",
    "spotted deer wildlife sanctuary india",
    "gaur indian bison wildlife forest",
    "nilgiri langur monkey forest india",
  ],
  "drone-photography": [
    "aerial drone view hill station india",
    "aerial view tea plantation drone",
    "aerial view mountain valley road drone",
    "aerial view lake forest drone india",
  ],
  sunrise: [
    "sunrise misty hills india",
    "sunrise over tea plantation",
    "sunrise mountain valley fog india",
    "sunrise hill station clouds",
  ],
  sunset: [
    "sunset hills india golden hour",
    "sunset over lake mountains india",
    "sunset valley silhouette hills",
    "sunset tea garden golden light",
  ],
  food: [
    "south indian breakfast dosa idli",
    "indian filter coffee tea estate",
    "south indian thali food",
    "homemade indian food hill station",
  ],
  hotels: [
    "luxury hill resort hotel room",
    "cozy mountain resort room india",
    "hotel balcony mountain view",
    "resort swimming pool hills",
  ],
  festivals: [
    "indian festival celebration colors",
    "diwali lights celebration india",
    "local festival dance india hills",
    "indian festival lanterns night",
  ],
  adventure: [
    "trekking hikers mountain trail india",
    "zipline adventure forest",
    "camping tent mountains india",
  ],
  waterfalls: ["waterfall cascade forest india", "waterfall rocks stream india"],
  "tea-estates": ["tea plantation workers picking leaves", "tea factory processing india"],
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

async function fetchCategory(slug, queries, credits) {
  const outDir = path.join(ROOT, "public", "images", "gallery", slug);
  await fs.mkdir(outDir, { recursive: true });
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const n = i + 1;
    const destPath = path.join(outDir, `${n}.jpg`);
    const exists = await fs
      .stat(destPath)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      console.log(`Skipping gallery/${slug}/${n}.jpg — already exists`);
      continue;
    }
    console.log(`Fetching gallery/${slug}/${n}.jpg — query: ${query}`);
    const photo = await searchPhoto(query);
    if (!photo) {
      console.warn(`  no results for "${query}", skipping`);
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
  const credits = ["# Gallery photography credits\n\nPhotos via the Unsplash API. Do not remove attribution.\n"];

  for (const [slug, queries] of Object.entries(GALLERY_QUERIES)) {
    await fetchCategory(slug, queries, credits);
  }

  const creditsPath = path.join(ROOT, "public", "images", "gallery", "IMAGE_CREDITS.md");
  const prev = await fs.readFile(creditsPath, "utf8").catch(() => "");
  await fs.writeFile(creditsPath, prev + credits.join("\n") + "\n", "utf8");
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
