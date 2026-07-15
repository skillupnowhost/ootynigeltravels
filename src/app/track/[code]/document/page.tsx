import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBookingByCode } from "@/lib/db/queries/bookings";
import { getDriverById } from "@/lib/db/queries/drivers";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { TripDocumentActions } from "@/components/booking/TripDocumentActions";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { site } from "@/lib/config/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ code: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { code } = await params;
  return { title: `Trip Document — ${code.toUpperCase()}` };
}

export default async function TripDocumentPage({ params }: { params: Params }) {
  const { code } = await params;
  const booking = getBookingByCode(code);
  if (!booking) notFound();

  const driver = booking.driver_id ? getDriverById(booking.driver_id) : undefined;
  const vehicle = booking.fleet_id ? fleetRepo.getById(booking.fleet_id) : undefined;

  return (
    <section className="container-luxe max-w-3xl py-12 print:py-0">
      <TripDocumentActions />

      <div className="rounded-3xl border border-forest-100 bg-white p-8 print:rounded-none print:border-0 print:p-0 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-forest-100 pb-6">
          <div className="flex items-start gap-3">
            <Image
              src="/images/brand/logo-full.png"
              alt={site.name}
              width={1024}
              height={1024}
              className="h-14 w-auto shrink-0 print:h-16"
            />
            <div>
              <p className="font-display text-2xl text-forest-950">{site.name}</p>
              <p className="text-xs text-charcoal-500">{site.address}</p>
              <p className="text-xs text-charcoal-500">
                {site.phone} · {site.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Trip Document</p>
            <p className="font-display text-xl text-forest-950">{booking.booking_code}</p>
            <span className="mt-1 inline-block rounded-full bg-forest-900 px-3 py-1 text-xs font-semibold text-ivory-50 print:border print:border-forest-900 print:bg-transparent print:text-forest-900">
              {booking.status}
            </span>
            {booking.cancel_requested === 1 && booking.status !== "Cancelled" && (
              <p className="mt-1 text-[11px] font-semibold text-gold-700">Cancellation requested</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Guest Details</h2>
            <div className="mt-2 space-y-1 text-sm text-charcoal-700">
              <p className="font-medium text-forest-950">{booking.guest_name}</p>
              <p>{booking.guest_phone}</p>
              {booking.guest_email && <p>{booking.guest_email}</p>}
              <p>
                {booking.adults} adult{booking.adults === 1 ? "" : "s"}
                {booking.children > 0 &&
                  ` · ${booking.children} child${booking.children === 1 ? "" : "ren"}`}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Trip Details</h2>
            <div className="mt-2 space-y-1 text-sm text-charcoal-700">
              {booking.destination && <p className="font-medium text-forest-950">{booking.destination}</p>}
              <p>
                {booking.end_date
                  ? `${formatDate(booking.travel_date)} → ${formatDate(booking.end_date)}`
                  : formatDate(booking.travel_date)}
                {booking.pickup_time && ` · ${booking.pickup_time}`}
              </p>
              <p>Pickup: {booking.pickup_location}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Vehicle &amp; Driver</h2>
            <div className="mt-2 space-y-1 text-sm text-charcoal-700">
              {vehicle ? <p className="font-medium text-forest-950">{vehicle.name}</p> : <p>To be assigned</p>}
              {booking.vehicle_number && <p>Reg. no: {booking.vehicle_number}</p>}
              {driver && (
                <p>
                  {driver.name} · {driver.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Payment</h2>
            <div className="mt-2 space-y-1 text-sm text-charcoal-700">
              <p className="font-display text-lg text-forest-950">{formatINR(booking.estimate_amount)}</p>
              <p>Status: {booking.payment_status}</p>
              {booking.coupon_code && <p>Coupon applied: {booking.coupon_code}</p>}
            </div>
          </div>
        </div>

        {booking.itinerary.length > 0 && (
          <div className="mt-6 border-t border-forest-100 pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
              Trip Plan — {booking.itinerary.length} Day{booking.itinerary.length === 1 ? "" : "s"} /{" "}
              {Math.max(booking.itinerary.length - 1, 0)} Night{booking.itinerary.length - 1 === 1 ? "" : "s"}
            </h2>
            <ol className="mt-3 space-y-4">
              {booking.itinerary.map((day) => (
                <li key={day.day} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-900 text-[11px] font-semibold text-ivory-50 print:border print:border-forest-900 print:bg-transparent print:text-forest-900">
                    {day.day}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-forest-950">{day.title}</p>
                    {day.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-charcoal-500">{day.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {booking.remarks && (
          <div className="mt-6 border-t border-forest-100 pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Remarks</h2>
            <p className="mt-2 text-sm text-charcoal-700">{booking.remarks}</p>
          </div>
        )}

        {booking.history.length > 0 && (
          <div className="mt-6 border-t border-forest-100 pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Status History</h2>
            <ul className="mt-2 space-y-1">
              {booking.history.map((h) => (
                <li key={h.id} className="text-xs text-charcoal-500">
                  <span className="font-medium text-forest-900">{h.status}</span>
                  {h.note && ` — ${h.note}`} · {formatDateTime(h.created_at)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 border-t border-forest-100 pt-4 text-[11px] leading-relaxed text-charcoal-500">
          Issued {formatDateTime(new Date().toISOString())}. This document confirms trip details on file with{" "}
          {site.name} and is not a payment receipt. For assistance, contact {site.phone} or {site.bookingEmail}.
        </div>
      </div>
    </section>
  );
}
