import { db } from "../client";
import type { DestinationImage } from "../types";

export function listDestinationImages(destinationId: number, activeOnly = false): DestinationImage[] {
  const sql = activeOnly
    ? "SELECT * FROM destination_images WHERE destination_id = ? AND active = 1 ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM destination_images WHERE destination_id = ? ORDER BY sort_order ASC, id ASC";
  return db.prepare(sql).all(destinationId) as DestinationImage[];
}

export function listAllDestinationImages(activeOnly = false): DestinationImage[] {
  const sql = activeOnly
    ? "SELECT * FROM destination_images WHERE active = 1 ORDER BY destination_id ASC, sort_order ASC, id ASC"
    : "SELECT * FROM destination_images ORDER BY destination_id ASC, sort_order ASC, id ASC";
  return db.prepare(sql).all() as DestinationImage[];
}

export function getDestinationImageById(id: number): DestinationImage | undefined {
  return db.prepare("SELECT * FROM destination_images WHERE id = ?").get(id) as DestinationImage | undefined;
}

export interface DestinationImageInput {
  destination_id: number;
  src: string;
  alt: string;
  sort_order?: number;
  active?: number;
}

export function createDestinationImage(input: DestinationImageInput): DestinationImage {
  const result = db
    .prepare(
      `INSERT INTO destination_images (destination_id, src, alt, sort_order, active)
       VALUES (@destination_id, @src, @alt, @sort_order, @active)`
    )
    .run({
      destination_id: input.destination_id,
      src: input.src,
      alt: input.alt,
      sort_order: input.sort_order ?? 0,
      active: input.active ?? 1,
    });
  return getDestinationImageById(Number(result.lastInsertRowid))!;
}

export function updateDestinationImage(id: number, input: Partial<DestinationImageInput>): void {
  const existing = getDestinationImageById(id);
  if (!existing) return;
  db.prepare(
    `UPDATE destination_images SET src = @src, alt = @alt, sort_order = @sort_order, active = @active WHERE id = @id`
  ).run({
    id,
    src: input.src ?? existing.src,
    alt: input.alt ?? existing.alt,
    sort_order: input.sort_order ?? existing.sort_order,
    active: input.active ?? existing.active,
  });
}

export function removeDestinationImage(id: number): void {
  db.prepare("DELETE FROM destination_images WHERE id = ?").run(id);
}

export function reorderDestinationImages(destinationId: number, orderedIds: number[]): void {
  const stmt = db.prepare(
    "UPDATE destination_images SET sort_order = ? WHERE id = ? AND destination_id = ?"
  );
  orderedIds.forEach((id, index) => stmt.run(index, id, destinationId));
}
