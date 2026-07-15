"use client";

import { useState } from "react";
import { RevealGroup } from "@/components/ui/Reveal";
import { BookingCard } from "@/components/account/BookingCard";
import type { Booking } from "@/lib/db/types";
import type { TripBucket } from "@/lib/trips";

const TABS: { key: TripBucket; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "current", label: "Current" },
  { key: "previous", label: "Previous" },
];

export function TripsTabs({
  buckets,
  phone,
}: {
  buckets: Record<TripBucket, Booking[]>;
  phone: string;
}) {
  const [active, setActive] = useState<TripBucket>("upcoming");
  const trips = buckets[active];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active === tab.key
                ? "bg-forest-900 text-ivory-50"
                : "border border-forest-200 text-forest-900 hover:border-gold-400"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({buckets[tab.key].length})</span>
          </button>
        ))}
      </div>

      {trips.length === 0 ? (
        <p className="mt-6 text-sm text-charcoal-500">No {active} trips to show.</p>
      ) : (
        <RevealGroup className="mt-6 space-y-4">
          {trips.map((b) => (
            <BookingCard key={b.id} booking={b} phone={phone} />
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
