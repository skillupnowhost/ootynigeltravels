// One-off, manually-run script — mirrors scripts/fetch-package-images.mjs's
// download pipeline for blog post cover photos: public/images/blog/<slug>.jpg,
// then writes the path into blog_posts.cover_image for each post.
//
//   node scripts/fetch-blog-images.mjs
//
// Requires UNSPLASH_ACCESS_KEY in .env.local (same key fetch-package-images.mjs uses).

import fs from "node:fs/promises";
import path from "node:path";
import { openDb, ROOT } from "./lib/db.mjs";

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY || ACCESS_KEY === "change-me") {
  console.error("UNSPLASH_ACCESS_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const BLOG_QUERIES = {
  "best-time-to-visit-ooty": "ooty hills misty season landscape india",
  "nilgiri-tea-estate-guide": "tea estate worker plucking leaves india",
  "mudumalai-safari-tips": "jeep safari forest elephant india",
};

const OUT_DIR = path.join(ROOT, "public", "images", "blog");
const UTM = "utm_source=ooty-nigel-travels&utm_medium=referral";

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

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const db = await openDb();
  const update = db.prepare("UPDATE blog_posts SET cover_image = ? WHERE slug = ?");

  const credits = ["# Blog cover photography credits\n\nPhotos via the Unsplash API. Do not remove attribution.\n"];

  for (const [slug, query] of Object.entries(BLOG_QUERIES)) {
    const publicPath = `/images/blog/${slug}.jpg`;
    const destPath = path.join(OUT_DIR, `${slug}.jpg`);
    const exists = await fs
      .stat(destPath)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      console.log(`Fetching "${slug}" — query: ${query}`);
      const photo = await searchPhoto(query);
      if (!photo) {
        console.warn(`  no results for ${slug}, skipping`);
        continue;
      }
      await downloadImage(photo, destPath);
      await trackDownload(photo);
      credits.push(
        `- \`${publicPath}\` — Photo by [${photo.user.name}](${photo.user.links.html}?${UTM}) on [Unsplash](${photo.links.html}?${UTM})`
      );
      console.log(`  saved ${destPath}`);
    } else {
      console.log(`Skipping "${slug}" — already exists`);
    }
    const result = await update.run(publicPath, slug);
    if (result.rowCount > 0) console.log(`  set cover_image for ${slug}`);
  }

  await db.close();

  const creditsPath = path.join(OUT_DIR, "IMAGE_CREDITS.md");
  const prev = await fs.readFile(creditsPath, "utf8").catch(() => "");
  await fs.writeFile(creditsPath, prev + credits.join("\n") + "\n", "utf8");
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
