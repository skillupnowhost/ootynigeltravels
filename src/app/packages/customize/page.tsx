import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CustomTripForm } from "@/components/forms/CustomTripForm";
import { PackageCustomizeForm } from "@/components/forms/PackageCustomizeForm";
import { ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { packagesRepo } from "@/lib/db/queries/packages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build Your Own Trip",
  description: "Don't see the fit? Tell us your trip type, the places you want to see and your travel dates — we'll put together a custom Nilgiris itinerary and pricing.",
  alternates: { canonical: "/packages/customize" },
};

type SearchParams = Promise<{ package?: string }>;

export default async function CustomizeTripPage({ searchParams }: { searchParams: SearchParams }) {
  const { package: packageSlug } = await searchParams;
  const pkg = packageSlug ? await packagesRepo.getBySlug(packageSlug) : undefined;

  if (pkg && pkg.active) {
    const fleet = await fleetRepo.list(true);
    return (
      <>
        <PageHero
          eyebrow="Customize Package"
          title={`Tailor "${pkg.name}" to your trip`}
          description="Adjust dates, hotel category, vehicle, meals and sightseeing add-ons — see the total update live, then send it to our team for confirmation."
          seed="customize-hero"
          variant="forest"
        >
          <div className="mt-6 flex items-center gap-2 text-sm text-forest-200">
            <ShieldBadgeIcon size={18} className="text-gold-400" />
            No payment required — this is a free planning request, not a booking.
          </div>
        </PageHero>
        <section className="container-luxe py-16">
          <PackageCustomizeForm pkg={pkg} fleet={fleet} />
        </section>
      </>
    );
  }

  const destinations = await destinationsRepo.list(true);

  return (
    <>
      <PageHero
        eyebrow="Customized Trips"
        title="Tell us your trip, we'll build the plan"
        description="Pick a trip type, the places you'd like to see, and roughly when you're travelling. Our team turns it into a priced itinerary — no fixed package required."
        seed="customize-hero"
        variant="forest"
      >
        <div className="mt-6 flex items-center gap-2 text-sm text-forest-200">
          <ShieldBadgeIcon size={18} className="text-gold-400" />
          No payment required — this is a free planning request, not a booking.
        </div>
      </PageHero>

      <section className="container-luxe py-16">
        <div className="mx-auto max-w-3xl">
          <CustomTripForm destinations={destinations} />
        </div>
      </section>
    </>
  );
}
