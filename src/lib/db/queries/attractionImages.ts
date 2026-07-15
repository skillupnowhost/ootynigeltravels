import { db } from "../client";
import type { AttractionImage } from "../types";

export function listAttractionImages(attractionId: number, activeOnly = false): AttractionImage[] {
  const sql = activeOnly
    ? "SELECT * FROM attraction_images WHERE attraction_id = ? AND active = 1 ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM attraction_images WHERE attraction_id = ? ORDER BY sort_order ASC, id ASC";
  return db.prepare(sql).all(attractionId) as AttractionImage[];
}

export function listAllAttractionImages(activeOnly = false): AttractionImage[] {
  const sql = activeOnly
    ? "SELECT * FROM attraction_images WHERE active = 1 ORDER BY attraction_id ASC, sort_order ASC, id ASC"
    : "SELECT * FROM attraction_images ORDER BY attraction_id ASC, sort_order ASC, id ASC";
  return db.prepare(sql).all() as AttractionImage[];
}

export function getAttractionImageById(id: number): AttractionImage | undefined {
  return db.prepare("SELECT * FROM attraction_images WHERE id = ?").get(id) as AttractionImage | undefined;
}

export interface AttractionImageInput {
  attraction_id: number;
  src: string;
  alt: string;
  sort_order?: number;
  active?: number;
}

export function createAttractionImage(input: AttractionImageInput): AttractionImage {
  const result = db
    .prepare(
      `INSERT INTO attraction_images (attraction_id, src, alt, sort_order, active)
       VALUES (@attraction_id, @src, @alt, @sort_order, @active)`
    )
    .run({
      attraction_id: input.attraction_id,
      src: input.src,
      alt: input.alt,
      sort_order: input.sort_order ?? 0,
      active: input.active ?? 1,
    });
  return getAttractionImageById(Number(result.lastInsertRowid))!;
}

export function updateAttractionImage(id: number, input: Partial<AttractionImageInput>): void {
  const existing = getAttractionImageById(id);
  if (!existing) return;
  db.prepare(
    `UPDATE attraction_images SET src = @src, alt = @alt, sort_order = @sort_order, active = @active WHERE id = @id`
  ).run({
    id,
    src: input.src ?? existing.src,
    alt: input.alt ?? existing.alt,
    sort_order: input.sort_order ?? existing.sort_order,
    active: input.active ?? existing.active,
  });
}

export function removeAttractionImage(id: number): void {
  db.prepare("DELETE FROM attraction_images WHERE id = ?").run(id);
}

export function reorderAttractionImages(attractionId: number, orderedIds: number[]): void {
  const stmt = db.prepare(
    "UPDATE attraction_images SET sort_order = ? WHERE id = ? AND attraction_id = ?"
  );
  orderedIds.forEach((id, index) => stmt.run(index, id, attractionId));
}
