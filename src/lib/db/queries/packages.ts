import { db } from "../client";
import { createSlugRepo } from "../helpers";
import type { TourPackage } from "../types";

export const packagesRepo = createSlugRepo<TourPackage>(db, "packages", [
  "itinerary",
  "includes",
  "excludes",
  "faqs",
  "highlights",
  "gallery",
  "vehicle_options",
  "places_covered",
]);

export function relatedPackages(pkg: TourPackage, limit = 3): TourPackage[] {
  return packagesRepo
    .list(true)
    .filter((p) => p.category === pkg.category && p.slug !== pkg.slug)
    .slice(0, limit);
}
