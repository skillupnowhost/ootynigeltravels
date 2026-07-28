import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { PackagesBrowser } from "@/components/packages/PackagesBrowser";
import { packagesRepo } from "@/lib/db/queries/packages";
import { fleetRepo } from "@/lib/db/queries/fleet";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ooty Tour Packages & Trip Packages — Family, Honeymoon, Adventure",
  description:
    "Ooty tour packages and trip plans for family, honeymoon, adventure and friends' getaways across the Nilgiris — or build your own custom itinerary. Every package includes a private chauffeur.",
  keywords: [
    "Ooty tour packages",
    "Ooty trip packages",
    "Nilgiris tour packages",
    "Ooty honeymoon package",
    "Ooty family package",
    "Ooty group tour package",
  ],
  alternates: { canonical: "/packages" },
};

export default async function PackagesPage() {
  const [packages, fleet] = await Promise.all([packagesRepo.list(true), fleetRepo.list(true)]);
  const vehicleCategories = Array.from(new Set(fleet.map((v) => v.category)));

  return (
    <>
      <PageHero
        eyebrow="Trip Packages & Plans"
        title="A trip style for every kind of traveller"
        description="Family days out, honeymoon escapes, adventure trails and friends' getaways — every plan includes a private chauffeur. Don't see the fit? Build your own."
        seed="packages-hero"
        variant="tea-rows"
      />

      <section className="container-luxe py-20">
        <Suspense fallback={null}>
          <PackagesBrowser packages={packages} vehicleCategories={vehicleCategories} />
        </Suspense>
      </section>
    </>
  );
}
