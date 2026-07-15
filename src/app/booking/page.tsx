import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { PlanJourneyForm } from "@/components/booking/PlanJourneyForm";
import { ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";
import { packagesRepo } from "@/lib/db/queries/packages";
import { destinationsRepo } from "@/lib/db/queries/destinations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plan Your Ooty Journey",
  description: "Guest booking — no account required. Choose a destination, a signature package, and your travel dates.",
  alternates: { canonical: "/booking" },
};

export default async function BookingPage() {
  const [packages, destinations] = await Promise.all([
    packagesRepo.list(true),
    destinationsRepo.list(true),
  ]);

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
        <PlanJourneyForm packages={packages} destinations={destinations} />
      </section>
    </>
  );
}
