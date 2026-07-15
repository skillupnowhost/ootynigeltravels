// One-off, manually-run script — NOT part of `npm run db:reset`.
// Downloads real, theme-matched, high-resolution photography from the Unsplash API
// into public/images/packages/<category>/ so the live site never depends on an
// external host at runtime. Re-run any time to refresh the set.
//
//   node scripts/fetch-package-images.mjs
//
// Requires UNSPLASH_ACCESS_KEY in .env.local (get one free at
// https://unsplash.com/oauth/applications).

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

// One themed search per real (non-virtual) category. "Customized" has no packages
// of its own, so it's skipped.
const CATEGORY_QUERIES = {
  Family: "family vacation hill station india",
  Couple: "couple travel scenic lake",
  Honeymoon: "honeymoon romantic hills sunset",
  Friends: "friends road trip mountains",
  Adventure: "forest trail adventure hiking india",
  Group: "group tour bus travel mountains",
  Weekend: "weekend getaway hills cottage",
  Wildlife: "wildlife safari forest india tiger",
  NatureTea: "tea plantation misty hills",
  HillStation: "hill station india mountains viewpoint",
  Luxury: "luxury resort mountains infinity pool",
  Budget: "backpacking budget travel hills",
  Corporate: "corporate retreat resort meeting",
  Student: "student group trip college outdoor",
};

const OUT_DIR = path.join(ROOT, "public", "images", "packages");
const IMAGES_PER_CATEGORY = 6;
const UTM = "utm_source=ooty-nigel-travels&utm_medium=referral";

async function searchPhotos(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=${IMAGES_PER_CATEGORY}&orientation=landscape&content_filter=high`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Unsplash search failed for "${query}": ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.results ?? [];
}

async function trackDownload(photo) {
  // Required by Unsplash API guidelines whenever a photo is actually used/downloaded.
  try {
    await fetch(`${photo.links.download_location}&client_id=${ACCESS_KEY}`);
  } catch {
    // non-fatal — attribution ping failing shouldn't block the asset pipeline
  }
}

async function downloadImage(photo, destPath) {
  const src = `${photo.urls.raw}&w=1600&q=80&fm=jpg&fit=crop`;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Download failed for ${photo.id}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const prevManifest = await fs
    .readFile(path.join(OUT_DIR, "manifest.json"), "utf8")
    .then(JSON.parse)
    .catch(() => ({}));
  const prevCredits = await fs
    .readFile(path.join(OUT_DIR, "IMAGE_CREDITS.md"), "utf8")
    .catch(() => "# Package photography credits\n\nPhotos via the Unsplash API. Do not remove attribution.\n");
  const credits = [prevCredits];
  const manifest = { ...prevManifest };

  for (const [category, query] of Object.entries(CATEGORY_QUERIES)) {
    const categoryDirCheck = path.join(OUT_DIR, category);
    const already = await fs
      .readdir(categoryDirCheck)
      .then((files) => files.filter((f) => f.endsWith(".jpg")).length)
      .catch(() => 0);
    if (already >= IMAGES_PER_CATEGORY) {
      console.log(`Skipping "${category}" — already has ${already} images`);
      manifest[category] = Array.from(
        { length: already },
        (_, i) => `/images/packages/${category}/${i + 1}.jpg`
      );
      continue;
    }
    console.log(`Fetching "${category}" — query: ${query}`);
    const photos = await searchPhotos(query);
    if (photos.length === 0) {
      console.warn(`  no results for ${category}, skipping`);
      continue;
    }
    const categoryDir = path.join(OUT_DIR, category);
    await fs.mkdir(categoryDir, { recursive: true });

    const paths = [];
    credits.push(`\n## ${category}\n`);
    let i = 0;
    for (const photo of photos.slice(0, IMAGES_PER_CATEGORY)) {
      i += 1;
      const filename = `${i}.jpg`;
      const destPath = path.join(categoryDir, filename);
      await downloadImage(photo, destPath);
      await trackDownload(photo);
      const publicPath = `/images/packages/${category}/${filename}`;
      paths.push(publicPath);
      credits.push(
        `- \`${publicPath}\` — Photo by [${photo.user.name}](${photo.user.links.html}?${UTM}) on [Unsplash](${photo.links.html}?${UTM})`
      );
      console.log(`  saved ${publicPath}`);
    }
    manifest[category] = paths;
  }

  await fs.writeFile(path.join(OUT_DIR, "IMAGE_CREDITS.md"), credits.join("\n"), "utf8");
  await fs.writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log("\nDone. Manifest written to public/images/packages/manifest.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
