import { db, withTransaction } from "../client";
import type { DestinationImage } from "../types";

export async function listDestinationImages(destinationId: number, activeOnly = false): Promise<DestinationImage[]> {
  const sql = activeOnly
    ? "SELECT * FROM destination_images WHERE destination_id = ? AND active = 1 ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM destination_images WHERE destination_id = ? ORDER BY sort_order ASC, id ASC";
  return (await db.prepare(sql).all(destinationId)) as DestinationImage[];
}

export async function listAllDestinationImages(activeOnly = false): Promise<DestinationImage[]> {
  const sql = activeOnly
    ? "SELECT * FROM destination_images WHERE active = 1 ORDER BY destination_id ASC, sort_order ASC, id ASC"
    : "SELECT * FROM destination_images ORDER BY destination_id ASC, sort_order ASC, id ASC";
  return (await db.prepare(sql).all()) as DestinationImage[];
}

export async function getDestinationImageById(id: number): Promise<DestinationImage | undefined> {
  return (await db.prepare("SELECT * FROM destination_images WHERE id = ?").get(id)) as DestinationImage | undefined;
}

export interface DestinationImageInput {
  destination_id: number;
  src: string;
  alt: string;
  sort_order?: number;
  active?: number;
}

export async function createDestinationImage(input: DestinationImageInput): Promise<DestinationImage> {
  return (await db
    .prepare(
      `INSERT INTO destination_images (destination_id, src, alt, sort_order, active)
       VALUES (@destination_id, @src, @alt, @sort_order, @active)
       RETURNING *`
    )
    .get({
      destination_id: input.destination_id,
      src: input.src,
      alt: input.alt,
      sort_order: input.sort_order ?? 0,
      active: input.active ?? 1,
    })) as DestinationImage;
}

export async function updateDestinationImage(id: number, input: Partial<DestinationImageInput>): Promise<void> {
  const existing = await getDestinationImageById(id);
  if (!existing) return;
  await db.prepare(
    `UPDATE destination_images SET src = @src, alt = @alt, sort_order = @sort_order, active = @active WHERE id = @id`
  ).run({
    id,
    src: input.src ?? existing.src,
    alt: input.alt ?? existing.alt,
    sort_order: input.sort_order ?? existing.sort_order,
    active: input.active ?? existing.active,
  });
}

export async function removeDestinationImage(id: number): Promise<void> {
  await db.prepare("DELETE FROM destination_images WHERE id = ?").run(id);
}

export async function reorderDestinationImages(destinationId: number, orderedIds: number[]): Promise<void> {
  await withTransaction(async (tx) => {
    const stmt = tx.prepare(
      "UPDATE destination_images SET sort_order = ? WHERE id = ? AND destination_id = ?"
    );
    for (const [index, id] of orderedIds.entries()) {
      await stmt.run(index, id, destinationId);
    }
  });
}
