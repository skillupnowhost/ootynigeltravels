import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { requireUser } from "@/lib/auth/rbac";
import { listBookingsForCustomer } from "@/lib/db/queries/bookings";
import { bucketTrips } from "@/lib/trips";
import { TripsTabs } from "@/components/account/TripsTabs";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Trips",
};

export default async function TripsPage() {
  const user = await requireUser();
  const bookings = await listBookingsForCustomer(user.id);
  const buckets = bucketTrips(bookings);

  return (
    <>
      <PageHero eyebrow="My Trips" title="Your journeys with us" seed="trips-hero" />

      <section className="container-luxe py-16">
        {bookings.length === 0 ? (
          <p className="text-sm text-charcoal-500">
            No bookings yet — head to our{" "}
            <a href="/booking" className="font-semibold text-forest-900 hover:text-gold-700">
              booking page
            </a>{" "}
            to plan your first trip.
          </p>
        ) : (
          <Reveal>
            <TripsTabs buckets={buckets} phone={user.phone} />
          </Reveal>
        )}
      </section>
    </>
  );
}
