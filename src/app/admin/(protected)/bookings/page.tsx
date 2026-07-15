import Link from "next/link";
import { listAllBookings } from "@/lib/db/queries/bookings";
import { formatDate, formatINR } from "@/lib/format";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/db/types";
import { Reveal } from "@/components/ui/Reveal";
import { GlassSelect } from "@/components/ui/GlassSelect";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; q?: string }>;

const BOOKING_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-gold-50 text-gold-800",
  Confirmed: "bg-forest-100 text-forest-800",
  "Driver Assigned": "bg-gold-200 text-forest-900",
  "In Progress": "bg-forest-200 text-forest-900",
  Completed: "bg-forest-700 text-ivory-50",
  Cancelled: "bg-red-50 text-red-700",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  Unpaid: "bg-red-50 text-red-700",
  Partial: "bg-gold-50 text-gold-800",
  Paid: "bg-forest-100 text-forest-800",
};

function statusBadgeClass(status: string) {
  return BOOKING_STATUS_STYLES[status] ?? "bg-forest-100 text-forest-800";
}

function paymentBadgeClass(status: string) {
  return PAYMENT_STATUS_STYLES[status] ?? "bg-forest-100 text-forest-800";
}

export default async function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status, q } = await searchParams;
  const bookings = await listAllBookings({
    status: status && BOOKING_STATUSES.includes(status as BookingStatus) ? (status as BookingStatus) : undefined,
    search: q,
  });

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Bookings</h1>

        <form method="get" className="mt-4 flex flex-wrap gap-3 sm:mt-6">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, booking ID"
            className="input-field w-full sm:max-w-xs"
          />
          <GlassSelect
            name="status"
            defaultValue={status ?? ""}
            className="w-full sm:max-w-[180px]"
            options={[{ value: "", label: "All statuses" }, ...BOOKING_STATUSES.map((s) => ({ value: s, label: s }))]}
          />
          <button
            type="submit"
            className="rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800"
          >
            Filter
          </button>
        </form>

        {/* Card list on small screens */}
        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/admin/bookings/${b.id}`}
              className="flex flex-col gap-1.5 px-4 py-3 active:bg-forest-50/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-forest-900">{b.booking_code}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(b.status)}`}>
                  {b.status}
                </span>
              </div>
              {b.cancel_requested && (
                <span className="w-fit rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  Cancel requested
                </span>
              )}
              <div className="flex items-center justify-between gap-2 text-sm text-charcoal-500">
                <span className="truncate">{b.guest_name}</span>
                <span className="shrink-0">{b.guest_phone}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-charcoal-500">
                <span>{b.destination ?? "—"}</span>
                <span className="shrink-0">
                  {formatDate(b.travel_date)}
                  {b.end_date ? ` → ${formatDate(b.end_date)}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentBadgeClass(b.payment_status)}`}>
                  {b.payment_status}
                </span>
                <span className="text-sm font-medium text-forest-900">{formatINR(b.estimate_amount)}</span>
              </div>
            </Link>
          ))}
          {bookings.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-charcoal-500">No bookings match this filter.</p>
          )}
        </div>

        {/* Table on larger screens */}
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">Booking</th>
                <th className="px-5 py-3">Guest</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3">Travel dates</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="font-medium text-forest-900 hover:text-gold-700">
                      {b.booking_code}
                    </Link>
                    {b.cancel_requested ? (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        Cancel requested
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3">{b.guest_name}</td>
                  <td className="px-5 py-3">{b.guest_phone}</td>
                  <td className="px-5 py-3">{b.destination ?? "—"}</td>
                  <td className="px-5 py-3">
                    {formatDate(b.travel_date)}
                    {b.end_date ? ` → ${formatDate(b.end_date)}` : ""}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentBadgeClass(b.payment_status)}`}>
                      {b.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-3">{formatINR(b.estimate_amount)}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-charcoal-500">
                    No bookings match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
