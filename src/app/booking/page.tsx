import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PlanJourneyForm } from "@/components/booking/PlanJourneyForm";
import { ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";
import { packagesRepo } from "@/lib/db/queries/packages";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { listPickupLocations } from "@/lib/db/queries/pickupLocations";
import { attachPricingTiers } from "@/lib/pricing/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Ooty Taxi & Tour Packages Online | Ooty Nigel Travels",
  description:
    "Book your Ooty taxi, airport transfer, local sightseeing trip or custom Nilgiris holiday package online in minutes with no account required.",
  keywords: [
    "book Ooty taxi online",
    "Ooty tour booking",
    "Ooty trip booking online",
    "Coimbatore to Ooty cab booking",
    "book Ooty package online",
    "Ooty taxi booking",
    "Ooty holiday booking",
    "Ooty travel booking",
    "Coimbatore Ooty travel booking",
    "travel booking to Ooty",
  ],
  alternates: { canonical: "/booking" },
};

export default async function BookingPage() {
  const [rawPackages, destinations, pickupLocations] = await Promise.all([
    packagesRepo.list(true),
    destinationsRepo.list(true),
    listPickupLocations(true),
  ]);
  const packages = await attachPricingTiers(rawPackages);

  return (
    <>
      <PageHero
        eyebrow="Booking"
        title="Plan your Ooty journey"
        description="No account needed — book as a guest, and link your booking history later by creating an account with the same phone number."
        seed="booking-hero"
      >
        <div className="mt-6 flex items-center gap-2 text-sm text-forest-200">
          <ShieldBadgeIcon size={18} className="text-gold-400" />
          No payment required now — pay securely after our team confirms your trip.
        </div>
      </PageHero>
      <section className="container-luxe py-16">
        <PlanJourneyForm packages={packages} destinations={destinations} pickupLocations={pickupLocations} />
      </section>
    </>
  );
}
