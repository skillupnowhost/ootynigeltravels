import { db } from "../client";
import type { GalleryImage } from "../types";

export function listGalleryImages(activeOnly = false): GalleryImage[] {
  const sql = activeOnly
    ? "SELECT * FROM gallery_images WHERE active = 1 ORDER BY category ASC, sort_order ASC, id ASC"
    : "SELECT * FROM gallery_images ORDER BY category ASC, sort_order ASC, id ASC";
  return db.prepare(sql).all() as GalleryImage[];
}

export function listGalleryImagesByCategory(category: string, activeOnly = false): GalleryImage[] {
  const sql = activeOnly
    ? "SELECT * FROM gallery_images WHERE category = ? AND active = 1 ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM gallery_images WHERE category = ? ORDER BY sort_order ASC, id ASC";
  return db.prepare(sql).all(category) as GalleryImage[];
}

export function getGalleryImageById(id: number): GalleryImage | undefined {
  return db.prepare("SELECT * FROM gallery_images WHERE id = ?").get(id) as GalleryImage | undefined;
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

export function createGalleryImage(input: GalleryImageInput): GalleryImage {
  const result = db
    .prepare(
      `INSERT INTO gallery_images (category, src, alt, caption, credit, featured, sort_order, active)
       VALUES (@category, @src, @alt, @caption, @credit, @featured, @sort_order, @active)`
    )
    .run({
      category: input.category,
      src: input.src,
      alt: input.alt,
      caption: input.caption ?? null,
      credit: input.credit ?? null,
      featured: input.featured ?? 0,
      sort_order: input.sort_order ?? 0,
      active: input.active ?? 1,
    });
  return getGalleryImageById(Number(result.lastInsertRowid))!;
}

export function updateGalleryImage(id: number, input: GalleryImageInput): void {
  db.prepare(
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

export function removeGalleryImage(id: number): void {
  db.prepare("DELETE FROM gallery_images WHERE id = ?").run(id);
}

export function reorderGalleryImages(category: string, orderedIds: number[]): void {
  const stmt = db.prepare("UPDATE gallery_images SET sort_order = ? WHERE id = ? AND category = ?");
  orderedIds.forEach((id, index) => stmt.run(index, id, category));
}
