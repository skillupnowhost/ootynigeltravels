import { RevealItem } from "@/components/ui/Reveal";
import { CalendarCheckIcon, CarDriveIcon, MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import { CancelBookingButton } from "@/components/account/CancelBookingButton";
import { formatDate, formatINR } from "@/lib/format";
import type { Booking } from "@/lib/db/types";

export function BookingCard({ booking, phone }: { booking: Booking; phone: string }) {
  const b = booking;
  return (
    <RevealItem>
      <div className="rounded-2xl border border-forest-100 bg-white p-6 transition-shadow duration-300 hover:shadow-[0_16px_40px_-24px_rgba(11,59,46,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-display text-lg text-forest-950">
            <CarDriveIcon size={20} className="text-forest-600" />
            {b.booking_code}
          </p>
          <span className="rounded-full bg-forest-900 px-3 py-1 text-xs font-semibold text-ivory-50">
            {b.status}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-charcoal-500">
          <span className="flex items-center gap-1.5">
            <CalendarCheckIcon size={16} className="text-forest-500" loop={false} /> {formatDate(b.travel_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPinDropIcon size={16} className="text-forest-500" loop={false} /> {b.pickup_location}
          </span>
        </div>
        <p className="mt-3 font-display text-base text-forest-950">{formatINR(b.estimate_amount)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <a
            href={`/track?code=${b.booking_code}`}
            className="inline-block text-xs font-semibold text-gold-700 hover:underline"
          >
            View full status
          </a>
          {b.cancel_requested === 1 ? (
            <p className="text-xs font-semibold text-gold-700">Cancellation requested</p>
          ) : (
            !["Completed", "Cancelled"].includes(b.status) && (
              <CancelBookingButton code={b.booking_code} phone={phone} />
            )
          )}
        </div>
      </div>
    </RevealItem>
  );
}
