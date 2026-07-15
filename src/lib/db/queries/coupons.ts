import { db } from "../client";
import type { Coupon } from "../types";

export async function listCoupons(): Promise<Coupon[]> {
  return (await db.prepare("SELECT * FROM coupons ORDER BY created_at DESC").all()) as Coupon[];
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
  return (await db
    .prepare("SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)")
    .get(code)) as Coupon | undefined;
}

export async function createCoupon(input: {
  code: string;
  pct: number;
  note?: string | null;
  active?: boolean;
  expires_at?: string | null;
}): Promise<Coupon> {
  return (await db
    .prepare(
      `INSERT INTO coupons (code, pct, note, active, expires_at) VALUES (@code, @pct, @note, @active, @expires_at)
       RETURNING *`
    )
    .get({
      code: input.code.toUpperCase(),
      pct: input.pct,
      note: input.note ?? null,
      active: input.active === false ? 0 : 1,
      expires_at: input.expires_at ?? null,
    })) as Coupon;
}

export async function setCouponActive(id: number, active: boolean): Promise<void> {
  await db.prepare("UPDATE coupons SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
}

export async function updateCoupon(id: number, fields: { code: string; pct: number; note?: string | null }): Promise<void> {
  await db.prepare("UPDATE coupons SET code = ?, pct = ?, note = ? WHERE id = ?").run(
    fields.code.toUpperCase(),
    fields.pct,
    fields.note ?? null,
    id
  );
}

export async function deleteCoupon(id: number): Promise<void> {
  await db.prepare("DELETE FROM coupons WHERE id = ?").run(id);
}
