import { packagesRepo } from "@/lib/db/queries/packages";
import { listPricingTiers, listPricingTiersForPackages } from "@/lib/db/queries/pricingTiers";
import { getCouponByCode } from "@/lib/db/queries/coupons";
import { calculateBookingAmount, findMatchingTier, type BookingAmountBreakdown } from "./calc";
import type { CarType, PackagePricingTier, TourPackage } from "@/lib/db/types";

export type PackageWithTiers = TourPackage & { pricing_tiers: PackagePricingTier[] };

/** Attaches each package's active pricing tiers so the client-side live estimate can use the exact same tier data as the server. */
export async function attachPricingTiers(packages: TourPackage[]): Promise<PackageWithTiers[]> {
  const tiersByPackage = await listPricingTiersForPackages(packages.map((p) => p.id));
  return packages.map((p) => ({ ...p, pricing_tiers: tiersByPackage[p.id] ?? [] }));
}

export interface QuoteBookingInput {
  packageSlug: string;
  nights: number;
  days: number;
  adults: number;
  children: number;
  carType?: CarType | string | null;
  carDays?: number[];
  couponCode?: string | null;
}

export interface BookingQuote extends BookingAmountBreakdown {
  packageId: number;
  pricingTierId: number | null;
  couponValid: boolean;
}

/** Server-only authoritative quote — resolves the tier + coupon from the DB, then delegates the math to calc.ts. */
export async function quoteBooking(input: QuoteBookingInput): Promise<BookingQuote | null> {
  const pkg = await packagesRepo.getBySlug(input.packageSlug);
  if (!pkg) return null;

  const tiers = await listPricingTiers(pkg.id, true);
  const tier = findMatchingTier(tiers, input.nights, input.days);

  let couponPct: number | null = null;
  let couponValid = false;
  if (input.couponCode) {
    const coupon = await getCouponByCode(input.couponCode);
    const notExpired = !coupon?.expires_at || new Date(coupon.expires_at).getTime() > Date.now();
    if (coupon && coupon.active === 1 && notExpired) {
      couponPct = coupon.pct;
      couponValid = true;
    }
  }

  const breakdown = calculateBookingAmount({
    basePrice: pkg.price_from,
    tier,
    adults: input.adults,
    children: input.children,
    carType: input.carType,
    carDays: input.carDays,
    couponPct,
  });

  return { ...breakdown, packageId: pkg.id, pricingTierId: tier?.id ?? null, couponValid };
}
