import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { PackagesBrowser } from "@/components/packages/PackagesBrowser";
import { packagesRepo } from "@/lib/db/queries/packages";
import { fleetRepo } from "@/lib/db/queries/fleet";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trip Packages & Plans",
  description:
    "Family, honeymoon, adventure and friends trip plans across the Nilgiris — or build your own custom itinerary. Every package includes a private chauffeur.",
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
