// One-off, manually-run script that sources the photos the new homepage
// destination/hidden-gem slideshows need beyond what's already on disk:
//
//   1. public/images/destinations/<slug>-<n>.jpg — gap-fill photos for
//      destinations that had only 1-4 real local photos (Unsplash API,
//      same pipeline as scripts/fetch-extra-images.mjs).
//   2. public/images/attractions/<slug>-<n>.jpg — 4 extra angles for every
//      one of the 23 hidden gems (Wikimedia Commons search API, the same
//      method already used to source public/images/attractions/*.jpg).
//
//   node scripts/fetch-card-images.mjs
//
// Idempotent — skips any file that already exists, so it's safe to re-run
// after a partial run (e.g. after an Unsplash 50-req/hour limit resets).
// Requires UNSPLASH_ACCESS_KEY in .env.local for part 1; part 2 needs no key.

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

const UTM = "utm_source=ooty-nigel-travels&utm_medium=referral";
const CREDITS_PATH = path.join(ROOT, "public", "images", "EXTRA_IMAGE_CREDITS.md");
const creditLines = [];

async function fileExists(p) {
  return fs.stat(p).then(() => true).catch(() => false);
}

async function appendCredits(lines) {
  if (lines.length === 0) return;
  const prev = await fs.readFile(CREDITS_PATH, "utf8").catch(() => "");
  await fs.writeFile(CREDITS_PATH, prev + lines.join("\n") + "\n", "utf8");
}

// ---------- Part 1: destinations, via Unsplash ----------
const DESTINATION_QUERIES = {
  "mudumalai-2": "wild elephant herd indian forest",
  "mudumalai-3": "jeep safari forest track india",
  "mudumalai-4": "spotted deer forest india",
  "mudumalai-5": "river gorge forest india",
  "pykara-lake-2": "pine forest lake shoreline india",
  "pykara-lake-3": "boating lake hills india",
  "pykara-lake-4": "waterfall pine forest india",
  "pykara-lake-5": "misty pine forest road india",
  "avalanche-lake-2": "emerald lake still water forest",
  "avalanche-lake-3": "forest trekking trail hills india",
  "avalanche-lake-4": "lake reflection dawn forest",
  "avalanche-lake-5": "dense forest canopy valley india",
  "kotagiri-5": "hill town skyline india green hills",
  "ooty-lake-2": "pedal boats lake india",
  "ooty-lake-3": "eucalyptus trees walking path lake",
  "ooty-lake-4": "lake sunset hills india",
  "ooty-lake-5": "toy train lake india",
  "coimbatore-2": "airport terminal india",
  "coimbatore-3": "city street night india",
  "coimbatore-4": "hilltop temple south india",
  "coimbatore-5": "railway station india",
  "pine-forest-2": "sunlight pine forest canopy",
  "pine-forest-3": "forest walking trail pine trees",
  "pine-forest-4": "misty pine forest golden hour",
  "pine-forest-5": "tall pine trunks forest path",
};

async function fetchUnsplash() {
  const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (!ACCESS_KEY || ACCESS_KEY === "change-me") {
    console.warn("UNSPLASH_ACCESS_KEY is not set — skipping destination gap-fill photos.");
    return;
  }

  const outDir = path.join(ROOT, "public", "images", "destinations");
  await fs.mkdir(outDir, { recursive: true });

  for (const [key, query] of Object.entries(DESTINATION_QUERIES)) {
    const destPath = path.join(outDir, `${key}.jpg`);
    if (await fileExists(destPath)) {
      console.log(`[unsplash] skip ${key} — already exists`);
      continue;
    }
    try {
      const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=1&orientation=landscape&content_filter=high`;
      const res = await fetch(searchUrl, { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } });
      if (!res.ok) {
        console.warn(`[unsplash] search failed for "${key}": ${res.status}`);
        continue;
      }
      const data = await res.json();
      const photo = data.results?.[0];
      if (!photo) {
        console.warn(`[unsplash] no results for ${key}`);
        continue;
      }
      const imgRes = await fetch(`${photo.urls.raw}&w=1600&q=80&fm=jpg&fit=crop`);
      if (!imgRes.ok) {
        console.warn(`[unsplash] download failed for ${key}: ${imgRes.status}`);
        continue;
      }
      await fs.writeFile(destPath, Buffer.from(await imgRes.arrayBuffer()));
      fetch(`${photo.links.download_location}&client_id=${ACCESS_KEY}`).catch(() => {});
      creditLines.push(
        `- \`images/destinations/${key}.jpg\` — Photo by [${photo.user.name}](${photo.user.links.html}?${UTM}) on [Unsplash](${photo.links.html}?${UTM})`
      );
      console.log(`[unsplash] saved ${key}.jpg`);
    } catch (err) {
      console.warn(`[unsplash] error for ${key}:`, err.message);
    }
  }
}

// ---------- Part 2: hidden gems, via Wikimedia Commons ----------
const ATTRACTION_QUERIES = {
  ooty: "Ooty Udhagamandalam",
  nilgiris: "Nilgiri hills",
  coonoor: "Coonoor",
  kotagiri: "Kotagiri",
  "doddabetta-peak": "Doddabetta peak",
  "pykara-lake": "Pykara lake",
  "avalanche-lake": "Avalanche lake Nilgiris",
  "tea-gardens": "Nilgiri tea garden",
  "pine-forest": "pine forest Ooty",
  "botanical-garden": "Ooty botanical garden",
  "rose-garden": "Ooty rose garden",
  "shooting-point": "Nilgiri hills viewpoint",
  "dolphins-nose": "Dolphin's Nose Coonoor",
  "catherine-falls": "Catherine falls Kotagiri",
  "mudumalai-national-park": "Mudumalai national park",
  "wenlock-downs": "Wenlock Downs Ooty",
  "tea-factory-museum": "Nilgiri tea factory",
  "ooty-lake": "Ooty lake",
  "nilgiri-mountain-railway": "Nilgiri mountain railway",
  "sims-park": "Sim's park Coonoor",
  "kodanad-viewpoint": "Kodanad viewpoint",
  "elk-falls": "Elk falls Kotagiri",
};

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, "").trim();
}

async function searchCommons(query, limit) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1600&format=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": "OotyNigelTravels/1.0 (https://ootynigeltravels.example; contact: skillupnow.in@gmail.com)" },
  });
  if (!res.ok) throw new Error(`Commons search failed: ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data.query?.pages ?? {});
  return pages
    .filter((p) => /\.(jpe?g|png)$/i.test(p.title))
    .map((p) => ({
      title: p.title,
      thumburl: p.imageinfo?.[0]?.thumburl,
      descriptionurl: p.imageinfo?.[0]?.descriptionurl,
      artist: stripHtml(p.imageinfo?.[0]?.extmetadata?.Artist?.value),
      license: stripHtml(p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value) || "see file page for license",
    }))
    .filter((p) => p.thumburl);
}

async function fetchWikimedia() {
  const outDir = path.join(ROOT, "public", "images", "attractions");
  await fs.mkdir(outDir, { recursive: true });

  for (const [slug, query] of Object.entries(ATTRACTION_QUERIES)) {
    const targets = [];
    for (const n of [2, 3, 4, 5]) {
      const destPath = path.join(outDir, `${slug}-${n}.jpg`);
      if (await fileExists(destPath)) {
        console.log(`[commons] skip ${slug}-${n} — already exists`);
        continue;
      }
      targets.push(n);
    }
    if (targets.length === 0) continue;

    let results;
    try {
      results = await searchCommons(query, targets.length + 4);
    } catch (err) {
      console.warn(`[commons] search failed for "${slug}":`, err.message);
      continue;
    }

    let resultIdx = 0;
    for (const n of targets) {
      const destPath = path.join(outDir, `${slug}-${n}.jpg`);
      const photo = results[resultIdx];
      resultIdx += 1;
      if (!photo) {
        console.warn(`[commons] not enough results for ${slug}-${n}, skipping`);
        continue;
      }
      try {
        const imgRes = await fetch(photo.thumburl, {
          headers: { "User-Agent": "OotyNigelTravels/1.0 (contact: skillupnow.in@gmail.com)" },
        });
        if (!imgRes.ok) {
          console.warn(`[commons] download failed for ${slug}-${n}: ${imgRes.status}`);
          continue;
        }
        await fs.writeFile(destPath, Buffer.from(await imgRes.arrayBuffer()));
        creditLines.push(
          `- \`images/attractions/${slug}-${n}.jpg\` — ${photo.artist || "Unknown author"} (${photo.license}), via [Wikimedia Commons](${photo.descriptionurl})`
        );
        console.log(`[commons] saved ${slug}-${n}.jpg`);
      } catch (err) {
        console.warn(`[commons] error for ${slug}-${n}:`, err.message);
      }
    }
  }
}

async function main() {
  await fetchUnsplash();
  await fetchWikimedia();
  if (creditLines.length > 0) {
    await appendCredits(["", "# Card slideshow photography credits", "", ...creditLines]);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
