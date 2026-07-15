import { db, withTransaction } from "../client";
import type { GalleryImage } from "../types";

export async function listGalleryImages(activeOnly = false): Promise<GalleryImage[]> {
  const sql = activeOnly
    ? "SELECT * FROM gallery_images WHERE active = 1 ORDER BY category ASC, sort_order ASC, id ASC"
    : "SELECT * FROM gallery_images ORDER BY category ASC, sort_order ASC, id ASC";
  return (await db.prepare(sql).all()) as GalleryImage[];
}

export async function listGalleryImagesByCategory(category: string, activeOnly = false): Promise<GalleryImage[]> {
  const sql = activeOnly
    ? "SELECT * FROM gallery_images WHERE category = ? AND active = 1 ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM gallery_images WHERE category = ? ORDER BY sort_order ASC, id ASC";
  return (await db.prepare(sql).all(category)) as GalleryImage[];
}

export async function getGalleryImageById(id: number): Promise<GalleryImage | undefined> {
  return (await db.prepare("SELECT * FROM gallery_images WHERE id = ?").get(id)) as GalleryImage | undefined;
}

export interface GalleryImageInput {
  category: string;
  src: string;
  alt: string;
  caption?: string | null;
  credit?: string | null;
  featured?: number;
  sort_order?: number;
  active?: number;
}

export async function createGalleryImage(input: GalleryImageInput): Promise<GalleryImage> {
  return (await db
    .prepare(
      `INSERT INTO gallery_images (category, src, alt, caption, credit, featured, sort_order, active)
       VALUES (@category, @src, @alt, @caption, @credit, @featured, @sort_order, @active)
       RETURNING *`
    )
    .get({
      category: input.category,
      src: input.src,
      alt: input.alt,
      caption: input.caption ?? null,
      credit: input.credit ?? null,
      featured: input.featured ?? 0,
      sort_order: input.sort_order ?? 0,
      active: input.active ?? 1,
    })) as GalleryImage;
}

export async function updateGalleryImage(id: number, input: GalleryImageInput): Promise<void> {
  await db.prepare(
    `UPDATE gallery_images
     SET category = @category, src = @src, alt = @alt, caption = @caption, credit = @credit,
         featured = @featured, sort_order = @sort_order, active = @active
     WHERE id = @id`
  ).run({
    id,
    category: input.category,
    src: input.src,
    alt: input.alt,
    caption: input.caption ?? null,
    credit: input.credit ?? null,
    featured: input.featured ?? 0,
    sort_order: input.sort_order ?? 0,
    active: input.active ?? 1,
  });
}

export async function removeGalleryImage(id: number): Promise<void> {
  await db.prepare("DELETE FROM gallery_images WHERE id = ?").run(id);
}

export async function reorderGalleryImages(category: string, orderedIds: number[]): Promise<void> {
  await withTransaction(async (tx) => {
    const stmt = tx.prepare("UPDATE gallery_images SET sort_order = ? WHERE id = ? AND category = ?");
    for (const [index, id] of orderedIds.entries()) {
      await stmt.run(index, id, category);
    }
  });
}
