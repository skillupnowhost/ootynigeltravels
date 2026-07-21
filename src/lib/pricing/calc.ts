import type { CarType } from "@/lib/db/types";

/** Per-day surcharge for requesting a car on a given day, by vehicle category. */
export const CAR_TYPE_DAILY_RATE: Record<CarType, number> = {
  Hatchback: 1200,
  Sedan: 1500,
  SUV: 2200,
  "Premium SUV": 3000,
  "Tempo Traveller": 4500,
  "Luxury Vehicle": 6000,
};

export interface PricingTierLike {
  nights: number;
  days: number;
  price: number;
}

export interface CalculateBookingAmountInput {
  /** Package's base "starting from" price — used only when no tier matches. */
  basePrice: number;
  /** Nights/days-specific admin price, if one matches the selected dates. */
  tier?: PricingTierLike | null;
  adults: number;
  children: number;
  carType?: CarType | string | null;
  carDays?: number[];
  couponPct?: number | null;
  extraCharges?: number;
  discountAmount?: number;
}

export interface BookingAmountBreakdown {
  base: number;
  extraAdultsCost: number;
  childrenCost: number;
  carCost: number;
  subtotal: number;
  couponDiscount: number;
  discount: number;
  extraCharges: number;
  total: number;
}

/**
 * Single source of truth for booking pricing — used by both the server
 * action that persists a booking and the client-side live preview, so the
 * two can never drift. Tier price (if one matches nights/days) replaces the
 * base package price; everything else layers on top of whichever base wins.
 */
export function calculateBookingAmount(input: CalculateBookingAmountInput): BookingAmountBreakdown {
  const base = input.tier ? input.tier.price : input.basePrice;
  const extraAdults = Math.max(0, input.adults - 2);
  const extraAdultsCost = round10(extraAdults * base * 0.15);
  const childrenCost = round10((input.children ?? 0) * base * 0.08);

  const carRate = CAR_TYPE_DAILY_RATE[(input.carType ?? "") as CarType] ?? 0;
  const carCost = carRate * (input.carDays?.length ?? 0);

  const subtotal = base + extraAdultsCost + childrenCost + carCost;
  const couponDiscount = input.couponPct ? round10(subtotal * (input.couponPct / 100)) : 0;
  const discount = couponDiscount + (input.discountAmount ?? 0);
  const extraCharges = input.extraCharges ?? 0;

  const total = Math.max(0, subtotal - discount + extraCharges);

  return { base, extraAdultsCost, childrenCost, carCost, subtotal, couponDiscount, discount, extraCharges, total };
}

/** Picks the pricing tier matching the selected nights (falls back to closest days match), or null. */
export function findMatchingTier<T extends PricingTierLike>(
  tiers: T[] | undefined,
  nights: number,
  days: number
): T | null {
  if (!tiers || tiers.length === 0) return null;
  return tiers.find((t) => t.nights === nights && t.days === days) ?? tiers.find((t) => t.nights === nights) ?? null;
}

function round10(n: number): number {
  return Math.round(n / 10) * 10;
}
