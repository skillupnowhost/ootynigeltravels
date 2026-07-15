import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { TrackClient } from "@/components/booking/TrackClient";
import { HeadsetPulseIcon } from "@/components/ui/AnimatedIcons";

export const metadata: Metadata = {
  title: "Track Your Booking",
  description: "Look up a booking by ID or phone number to see its live status.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <>
      <PageHero
        eyebrow="Track"
        title="Track your booking"
        description="Look up a booking by ID or phone number to see its live status."
        seed="track-hero"
      />
      <section className="container-luxe max-w-2xl py-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-charcoal-500">
          <HeadsetPulseIcon size={20} className="text-forest-600" />
          Need help? Our team is a message away on WhatsApp or phone.
        </div>
        <Suspense fallback={null}>
          <TrackClient />
        </Suspense>
      </section>
    </>
  );
}
