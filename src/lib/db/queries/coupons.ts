import { db } from "../client";
import type { Coupon } from "../types";

export function listCoupons(): Coupon[] {
  return db.prepare("SELECT * FROM coupons ORDER BY created_at DESC").all() as Coupon[];
}

export function getCouponByCode(code: string): Coupon | undefined {
  return db
    .prepare("SELECT * FROM coupons WHERE code = ? COLLATE NOCASE")
    .get(code) as Coupon | undefined;
}

export function createCoupon(input: {
  code: string;
  pct: number;
  note?: string | null;
  active?: boolean;
  expires_at?: string | null;
}): Coupon {
  const result = db
    .prepare(
      `INSERT INTO coupons (code, pct, note, active, expires_at) VALUES (@code, @pct, @note, @active, @expires_at)`
    )
    .run({
      code: input.code.toUpperCase(),
      pct: input.pct,
      note: input.note ?? null,
      active: input.active === false ? 0 : 1,
      expires_at: input.expires_at ?? null,
    });
  return db
    .prepare("SELECT * FROM coupons WHERE id = ?")
    .get(Number(result.lastInsertRowid)) as Coupon;
}

export function setCouponActive(id: number, active: boolean): void {
  db.prepare("UPDATE coupons SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
}

export function updateCoupon(id: number, fields: { code: string; pct: number; note?: string | null }): void {
  db.prepare("UPDATE coupons SET code = ?, pct = ?, note = ? WHERE id = ?").run(
    fields.code.toUpperCase(),
    fields.pct,
    fields.note ?? null,
    id
  );
}

export function deleteCoupon(id: number): void {
  db.prepare("DELETE FROM coupons WHERE id = ?").run(id);
}
