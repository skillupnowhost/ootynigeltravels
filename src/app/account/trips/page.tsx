import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { requireUser } from "@/lib/auth/rbac";
import { listBookingsForCustomer } from "@/lib/db/queries/bookings";
import { listTripRequestsByPhone } from "@/lib/db/queries/tripRequests";
import { bucketTrips } from "@/lib/trips";
import { TripsTabs } from "@/components/account/TripsTabs";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate, formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Trips",
};

export default async function TripsPage() {
  const user = await requireUser();
  const bookings = await listBookingsForCustomer(user.id);
  const tripRequests = await listTripRequestsByPhone(user.phone);
  const buckets = bucketTrips(bookings);

  return (
    <>
      <PageHero eyebrow="My Trips" title="Your journeys with us" seed="trips-hero" />

      <section className="container-luxe py-16">
        {tripRequests.length > 0 && (
          <Reveal>
            <h2 className="font-display text-lg text-forest-950">Custom trip requests</h2>
            <div className="mt-4 space-y-4">
              {tripRequests.map((r) => (
                <div key={r.id} className="rounded-2xl border border-forest-100 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-forest-900">
                      {r.trip_type} trip · <span className="text-charcoal-500">{formatDate(r.created_at)}</span>
                    </p>
                    <span className="rounded-full bg-forest-100 px-3 py-1 text-xs font-medium text-forest-800">{r.status}</span>
                  </div>
                  {r.quotation_amount != null ? (
                    <div className="mt-3 rounded-xl bg-gold-50 p-3">
                      <p className="font-display text-xl text-forest-950">{formatINR(r.quotation_amount)}</p>
                      {r.quotation_note && <p className="mt-1 text-sm text-charcoal-700">{r.quotation_note}</p>}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-charcoal-500">Our team is preparing your quotation.</p>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {bookings.length === 0 ? (
          <p className={`text-sm text-charcoal-500 ${tripRequests.length > 0 ? "mt-10" : ""}`}>
            No bookings yet — head to our{" "}
            <a href="/booking" className="font-semibold text-forest-900 hover:text-gold-700">
              booking page
            </a>{" "}
            to plan your first trip.
          </p>
        ) : (
          <Reveal>
            <div className={tripRequests.length > 0 ? "mt-10" : ""}>
              <TripsTabs buckets={buckets} phone={user.phone} />
            </div>
          </Reveal>
        )}
      </section>
    </>
  );
}
