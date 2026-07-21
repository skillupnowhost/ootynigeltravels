import { db } from "../client";
import type { PackagePricingTier } from "../types";

export async function listPricingTiers(packageId: number, activeOnly = false): Promise<PackagePricingTier[]> {
  const sql = activeOnly
    ? "SELECT * FROM package_pricing_tiers WHERE package_id = ? AND active = 1 ORDER BY sort_order, nights"
    : "SELECT * FROM package_pricing_tiers WHERE package_id = ? ORDER BY sort_order, nights";
  return (await db.prepare(sql).all(packageId)) as PackagePricingTier[];
}

export async function listPricingTiersForPackages(
  packageIds: number[]
): Promise<Record<number, PackagePricingTier[]>> {
  if (packageIds.length === 0) return {};
  const rows = (await db
    .prepare(
      `SELECT * FROM package_pricing_tiers WHERE package_id = ANY(?) AND active = 1 ORDER BY package_id, sort_order, nights`
    )
    .all(packageIds)) as PackagePricingTier[];
  const byPackage: Record<number, PackagePricingTier[]> = {};
  for (const row of rows) {
    (byPackage[row.package_id] ??= []).push(row);
  }
  return byPackage;
}

export async function getPricingTierById(id: number): Promise<PackagePricingTier | undefined> {
  return (await db.prepare("SELECT * FROM package_pricing_tiers WHERE id = ?").get(id)) as
    | PackagePricingTier
    | undefined;
}

export async function createPricingTier(input: {
  package_id: number;
  nights: number;
  days: number;
  price: number;
  sort_order?: number;
}): Promise<PackagePricingTier> {
  return (await db
    .prepare(
      `INSERT INTO package_pricing_tiers (package_id, nights, days, price, sort_order)
       VALUES (@package_id, @nights, @days, @price, @sort_order) RETURNING *`
    )
    .get({
      package_id: input.package_id,
      nights: input.nights,
      days: input.days,
      price: input.price,
      sort_order: input.sort_order ?? 0,
    })) as PackagePricingTier;
}

export async function updatePricingTier(
  id: number,
  fields: { nights: number; days: number; price: number; sort_order?: number }
): Promise<void> {
  await db
    .prepare("UPDATE package_pricing_tiers SET nights = ?, days = ?, price = ?, sort_order = ? WHERE id = ?")
    .run(fields.nights, fields.days, fields.price, fields.sort_order ?? 0, id);
}

export async function setPricingTierActive(id: number, active: boolean): Promise<void> {
  await db.prepare("UPDATE package_pricing_tiers SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
}

export async function deletePricingTier(id: number): Promise<void> {
  await db.prepare("DELETE FROM package_pricing_tiers WHERE id = ?").run(id);
}
