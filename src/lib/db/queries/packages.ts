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

export async function relatedPackages(pkg: TourPackage, limit = 3): Promise<TourPackage[]> {
  return (await packagesRepo.list(true))
    .filter((p) => p.category === pkg.category && p.slug !== pkg.slug)
    .slice(0, limit);
}
