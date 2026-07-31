import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { PackagesBrowser } from "@/components/packages/PackagesBrowser";
import { packagesRepo } from "@/lib/db/queries/packages";
import { fleetRepo } from "@/lib/db/queries/fleet";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ooty Tour Packages & Private Taxi Trips | Ooty Nigel Travels",
  description:
    "Discover family, honeymoon, adventure, couple, group and custom Ooty tour packages with private chauffeur service across Ooty, Coonoor, Kotagiri and Mudumalai.",
  keywords: [
    "Ooty tour packages",
    "private taxi trip Ooty",
    "Nilgiris tour packages",
    "Ooty honeymoon package",
    "Ooty family package",
    "Ooty group tour package",
    "custom Ooty itinerary",
    "Ooty travel agency tour packages",
    "travel package to Ooty",
    "Ooty weekend package",
    "Coimbatore to Ooty package",
    "Ooty couple package",
    "Ooty adventure package",
    "Ooty family holiday package",
    "Coimbatore to Ooty package",
    "Ooty trip package",
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
        description="Family days out, couple getaways, honeymoon escapes, adventure trails and friends' getaways — every plan includes a private chauffeur. Don't see the fit? Build your own."
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
