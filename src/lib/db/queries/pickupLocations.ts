import { db } from "../client";
import type { PickupLocation } from "../types";

export async function listPickupLocations(activeOnly = false): Promise<PickupLocation[]> {
  const sql = activeOnly
    ? "SELECT * FROM pickup_locations WHERE active = 1 ORDER BY city, sort_order, label"
    : "SELECT * FROM pickup_locations ORDER BY city, sort_order, label";
  return (await db.prepare(sql).all()) as PickupLocation[];
}

export async function getPickupLocationById(id: number): Promise<PickupLocation | undefined> {
  return (await db.prepare("SELECT * FROM pickup_locations WHERE id = ?").get(id)) as
    | PickupLocation
    | undefined;
}

export async function isValidPickupLocation(label: string): Promise<boolean> {
  const row = (await db
    .prepare("SELECT id FROM pickup_locations WHERE label = ? AND active = 1")
    .get(label)) as { id: number } | undefined;
  return !!row;
}

export async function createPickupLocation(input: {
  city: string;
  label: string;
  active?: boolean;
  sort_order?: number;
}): Promise<PickupLocation> {
  return (await db
    .prepare(
      `INSERT INTO pickup_locations (city, label, active, sort_order) VALUES (@city, @label, @active, @sort_order)
       RETURNING *`
    )
    .get({
      city: input.city,
      label: input.label,
      active: input.active === false ? 0 : 1,
      sort_order: input.sort_order ?? 0,
    })) as PickupLocation;
}

export async function updatePickupLocation(
  id: number,
  fields: { city: string; label: string; sort_order?: number }
): Promise<void> {
  await db
    .prepare("UPDATE pickup_locations SET city = ?, label = ?, sort_order = ? WHERE id = ?")
    .run(fields.city, fields.label, fields.sort_order ?? 0, id);
}

export async function setPickupLocationActive(id: number, active: boolean): Promise<void> {
  await db.prepare("UPDATE pickup_locations SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
}

export async function deletePickupLocation(id: number): Promise<void> {
  await db.prepare("DELETE FROM pickup_locations WHERE id = ?").run(id);
}
