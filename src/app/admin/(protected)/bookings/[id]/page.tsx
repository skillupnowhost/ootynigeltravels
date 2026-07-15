import { notFound } from "next/navigation";
import { getBookingById, getBookingHistory } from "@/lib/db/queries/bookings";
import { listDrivers } from "@/lib/db/queries/drivers";
import { BookingActions } from "@/components/admin/BookingActions";
import { ItineraryEditor } from "@/components/admin/ItineraryEditor";
import { deleteBookingAction } from "@/lib/actions/adminBookings";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDateTime, formatINR } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { CalendarCheckIcon, MapPinDropIcon } from "@/components/ui/AnimatedIcons";

type Params = Promise<{ id: string }>;

const BOOKING_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-gold-50 text-gold-800",
  Confirmed: "bg-forest-100 text-forest-800",
  "Driver Assigned": "bg-gold-200 text-forest-900",
  "In Progress": "bg-forest-200 text-forest-900",
  Completed: "bg-forest-700 text-ivory-50",
  Cancelled: "bg-red-50 text-red-700",
};

function statusBadgeClass(status: string) {
  return BOOKING_STATUS_STYLES[status] ?? "bg-forest-100 text-forest-800";
}

export default async function AdminBookingDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const booking = await getBookingById(Number(id));
  if (!booking) notFound();

  const history = await getBookingHistory(booking.id);
  const drivers = await listDrivers({ activeOnly: true });
  const actor = await getCurrentUser();

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl text-forest-950 sm:text-2xl">{booking.booking_code}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          {actor?.role === "admin" && (
            <DeleteButton
              action={deleteBookingAction}
              id={booking.id}
              confirmLabel={`Permanently delete booking ${booking.booking_code}? This cannot be undone.`}
            />
          )}
        </div>

        <div className="mt-4 grid gap-6 sm:mt-6 sm:gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <BookingActions booking={booking} drivers={drivers} />
            <ItineraryEditor booking={booking} />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-forest-100 bg-white p-4 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Guest</h2>
              <p className="mt-2 font-display text-lg text-forest-950">{booking.guest_name}</p>
              <p className="text-sm text-charcoal-500">{booking.guest_phone}</p>
              {booking.guest_email && <p className="text-sm text-charcoal-500">{booking.guest_email}</p>}
              <div className="mt-4 space-y-2 border-t border-forest-100 pt-4 text-sm text-charcoal-700">
                {booking.destination && <p>Destination: {booking.destination}</p>}
                <p className="flex items-center gap-2">
                  <CalendarCheckIcon size={16} className="shrink-0 text-gold-700" loop={false} />
                  {booking.end_date
                    ? `${booking.travel_date} → ${booking.end_date}`
                    : `Travel date: ${booking.travel_date}`}
                </p>
                <p className="flex items-center gap-2">
                  <MapPinDropIcon size={16} className="shrink-0 text-gold-700" loop={false} />
                  Pickup: {booking.pickup_location}
                </p>
                {booking.pickup_time && <p>Time: {booking.pickup_time}</p>}
                <p>Adults: {booking.adults} · Children: {booking.children}</p>
                <p>Estimate: {formatINR(booking.estimate_amount)}</p>
                {booking.coupon_code && <p>Coupon: {booking.coupon_code}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-forest-100 bg-white p-4 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">History</h2>
              <ul className="mt-3 space-y-3">
                {history.map((h) => (
                  <li key={h.id} className="text-sm">
                    <span className="font-medium text-forest-900">{h.status}</span>
                    <span className="block text-xs text-charcoal-500">{h.note}</span>
                    <span className="block text-xs text-charcoal-400">{formatDateTime(h.created_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
