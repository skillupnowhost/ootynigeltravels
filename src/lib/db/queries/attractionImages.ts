import { db, withTransaction } from "../client";
import type { AttractionImage } from "../types";

export async function listAttractionImages(attractionId: number, activeOnly = false): Promise<AttractionImage[]> {
  const sql = activeOnly
    ? "SELECT * FROM attraction_images WHERE attraction_id = ? AND active = 1 ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM attraction_images WHERE attraction_id = ? ORDER BY sort_order ASC, id ASC";
  return (await db.prepare(sql).all(attractionId)) as AttractionImage[];
}

export async function listAllAttractionImages(activeOnly = false): Promise<AttractionImage[]> {
  const sql = activeOnly
    ? "SELECT * FROM attraction_images WHERE active = 1 ORDER BY attraction_id ASC, sort_order ASC, id ASC"
    : "SELECT * FROM attraction_images ORDER BY attraction_id ASC, sort_order ASC, id ASC";
  return (await db.prepare(sql).all()) as AttractionImage[];
}

export async function getAttractionImageById(id: number): Promise<AttractionImage | undefined> {
  return (await db.prepare("SELECT * FROM attraction_images WHERE id = ?").get(id)) as AttractionImage | undefined;
}

export interface AttractionImageInput {
  attraction_id: number;
  src: string;
  alt: string;
  sort_order?: number;
  active?: number;
}

export async function createAttractionImage(input: AttractionImageInput): Promise<AttractionImage> {
  return (await db
    .prepare(
      `INSERT INTO attraction_images (attraction_id, src, alt, sort_order, active)
       VALUES (@attraction_id, @src, @alt, @sort_order, @active)
       RETURNING *`
    )
    .get({
      attraction_id: input.attraction_id,
      src: input.src,
      alt: input.alt,
      sort_order: input.sort_order ?? 0,
      active: input.active ?? 1,
    })) as AttractionImage;
}

export async function updateAttractionImage(id: number, input: Partial<AttractionImageInput>): Promise<void> {
  const existing = await getAttractionImageById(id);
  if (!existing) return;
  await db.prepare(
    `UPDATE attraction_images SET src = @src, alt = @alt, sort_order = @sort_order, active = @active WHERE id = @id`
  ).run({
    id,
    src: input.src ?? existing.src,
    alt: input.alt ?? existing.alt,
    sort_order: input.sort_order ?? existing.sort_order,
    active: input.active ?? existing.active,
  });
}

export async function removeAttractionImage(id: number): Promise<void> {
  await db.prepare("DELETE FROM attraction_images WHERE id = ?").run(id);
}

export async function reorderAttractionImages(attractionId: number, orderedIds: number[]): Promise<void> {
  await withTransaction(async (tx) => {
    const stmt = tx.prepare(
      "UPDATE attraction_images SET sort_order = ? WHERE id = ? AND attraction_id = ?"
    );
    for (const [index, id] of orderedIds.entries()) {
      await stmt.run(index, id, attractionId);
    }
  });
}
