// One-off, manually-run script — mirrors scripts/fetch-extra-images.mjs's
// download pipeline to source real photography for the redesigned Gallery
// page's categories that have no existing usable assets under public/images/.
//
//   node scripts/fetch-gallery-images.mjs
//
// Saves to public/images/gallery/<category-slug>/<n>.jpg (numbered per query,
// starting at each category's configured `start` so it never overwrites
// files already claimed by local-reuse rows in scripts/seed.mjs).
// Requires UNSPLASH_ACCESS_KEY in .env.local (same key the other fetch-*
// scripts use). Safe to re-run — already-downloaded files are skipped, and a
// single Unsplash rate-limit error no longer aborts the whole run: it's
// logged and the script moves on to the next photo/category, so re-running
// this script (once the hourly quota resets) picks up wherever it left off.

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

// category-slug -> { start: first file number to write, queries: one distinct
// search per photo }. `start` lets a category top itself up without colliding
// with files already downloaded (or with local-reuse rows in seed.mjs).
const GALLERY_QUERIES = {
  // Small, high-priority gaps first so they finish within a single hourly
  // Unsplash quota even if a later, larger category gets rate-limited.
  avalanche: { start: 1, queries: ["avalanche lake nilgiris shola forest mist"] },
  pykara: { start: 1, queries: ["pykara lake boating deck india"] },
  wildlife: { start: 5, queries: ["sambar deer mudumalai forest india", "hornbill bird nilgiri forest"] },
  vehicles: { start: 1, queries: ["chauffeur driven car hill road india", "family sedan mountain road drive india"] },
  waterfalls: {
    start: 1,
    queries: [
      "kalhatti falls nilgiris india",
      "pykara falls india",
      "kattery falls coonoor india",
      "forest waterfall western ghats india",
    ],
  },
  doddabetta: {
    start: 1,
    queries: [
      "doddabetta peak telescope house india",
      "doddabetta peak sunrise view india",
      "highest peak nilgiris viewpoint",
      "misty mountain peak south india",
      "doddabetta peak forest trail",
    ],
  },
  lakes: {
    start: 1,
    queries: [
      "mountain lake reflection india hills",
      "lake boating hill station india sunrise",
      "still lake water mountains india",
      "lake shoreline mist hills india",
      "rowing boat lake mountains india",
    ],
  },
  "drone-photography": {
    start: 5,
    queries: [
      "aerial drone view winding mountain road",
      "aerial drone view forest reservoir india",
      "aerial view hairpin bends ghat road india",
      "aerial view green valley terraces india",
      "drone shot misty hills sunrise india",
      "aerial view small hill town india",
    ],
  },
  sunrise: {
    start: 5,
    queries: [
      "sunrise golden light forest india",
      "sunrise over valley clouds india",
      "sunrise silhouette trees hills india",
      "sunrise reflection lake mountains india",
      "sunrise viewpoint hikers india",
      "sunrise orange sky hill station",
    ],
  },
  sunset: {
    start: 5,
    queries: [
      "sunset over tea plantation india",
      "sunset silhouette mountains india",
      "sunset road trip hills india",
      "sunset clouds valley india",
      "sunset golden hour forest india",
      "sunset over lake boats india",
    ],
  },
  food: {
    start: 5,
    queries: [
      "banana leaf south indian meal",
      "masala chai hill station india",
      "fresh nilgiri tea leaves cup",
      "indian street food snacks",
      "homestyle curry rice india",
      "hot samosa tea india",
    ],
  },
  hotels: {
    start: 5,
    queries: [
      "hotel room mountain view window india",
      "resort dining area hills india",
      "hotel lobby cozy fireplace mountain",
      "resort garden view hills india",
      "hotel bedroom hill station india",
      "mountain resort exterior evening india",
      "boutique hotel room hills india",
    ],
  },
  festivals: {
    start: 3,
    queries: [
      "south india temple festival colors",
      "diwali oil lamps celebration india",
      "holi color festival crowd india",
      "traditional dance performance india festival",
      "flower rangoli festival decoration india",
      "festival fireworks night india",
      "harvest festival celebration south india",
      "festival street procession india",
    ],
  },
  adventure: {
    start: 1,
    queries: [
      "trekking hikers mountain trail india",
      "zipline adventure forest canopy",
      "camping tent mountains night india",
      "mountain biking trail forest india",
      "rock climbing cliff india adventure",
      "river rafting adventure india",
      "rappelling waterfall adventure india",
      "off road jeep trail forest india",
      "paragliding hills india adventure",
    ],
  },
};

async function searchPhoto(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=landscape&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Unsplash search failed for "${query}": ${res.status} ${body}`);
  }
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

let rateLimited = false;

async function fetchCategory(slug, { start, queries }, credits) {
  const outDir = path.join(ROOT, "public", "images", "gallery", slug);
  await fs.mkdir(outDir, { recursive: true });
  for (let i = 0; i < queries.length; i++) {
    if (rateLimited) return;
    const query = queries[i];
    const n = start + i;
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
    try {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`  failed: ${message}`);
      if (message.includes("403") || message.includes("Rate Limit")) {
        rateLimited = true;
        console.warn("  Unsplash hourly rate limit reached — stopping this run. Re-run this script after the limit resets to continue.");
        return;
      }
    }
  }
}

async function main() {
  const credits = ["# Gallery photography credits\n\nPhotos via the Unsplash API. Do not remove attribution.\n"];

  for (const [slug, config] of Object.entries(GALLERY_QUERIES)) {
    if (rateLimited) break;
    await fetchCategory(slug, config, credits);
  }

  const creditsPath = path.join(ROOT, "public", "images", "gallery", "IMAGE_CREDITS.md");
  const prev = await fs.readFile(creditsPath, "utf8").catch(() => "");
  await fs.writeFile(creditsPath, prev + credits.join("\n") + "\n", "utf8");
  console.log(rateLimited ? "\nStopped early (rate limited)." : "\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
