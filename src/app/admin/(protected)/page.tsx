import Link from "next/link";
import { IndianRupee, MessageSquare } from "lucide-react";
import { bookingStats, listAllBookings } from "@/lib/db/queries/bookings";
import { listContactMessages } from "@/lib/db/queries/contactMessages";
import { formatDate, formatINR } from "@/lib/format";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { CalendarCheckIcon, ClockHandsIcon } from "@/components/ui/AnimatedIcons";

export const dynamic = "force-dynamic";

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

export default function AdminDashboardPage() {
  const stats = bookingStats();
  const recentBookings = listAllBookings({ limit: 8 });
  const unhandledMessages = listContactMessages().filter((m) => !m.handled).length;
  const pendingBookings = stats.byStatus["Pending"] ?? 0;

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Dashboard</h1>
      </Reveal>

      <RevealGroup className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-5 lg:grid-cols-4">
        <RevealItem>
          <div className="rounded-2xl border border-forest-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
            <CalendarCheckIcon size={20} className="text-gold-700 sm:hidden" loop={false} />
            <CalendarCheckIcon size={24} className="hidden text-gold-700 sm:block" loop={false} />
            <p className="mt-2 font-display text-lg text-forest-950 sm:mt-3 sm:text-2xl">
              {stats.total.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-charcoal-500 sm:text-xs">Total bookings</p>
          </div>
        </RevealItem>
        <RevealItem>
          <div className="rounded-2xl border border-forest-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
            <ClockHandsIcon size={20} className="text-gold-700 sm:hidden" loop />
            <ClockHandsIcon size={24} className="hidden text-gold-700 sm:block" loop />
            <p className="mt-2 font-display text-lg text-forest-950 sm:mt-3 sm:text-2xl">
              {pendingBookings.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-charcoal-500 sm:text-xs">Pending bookings</p>
          </div>
        </RevealItem>
        <RevealItem>
          <div className="rounded-2xl border border-forest-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
            <MotionIcon preset="pop" className="text-gold-700">
              <IndianRupee size={18} className="sm:hidden" />
              <IndianRupee size={22} className="hidden sm:block" />
            </MotionIcon>
            <p className="mt-2 font-display text-lg text-forest-950 sm:mt-3 sm:text-2xl">
              {formatINR(stats.revenue)}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-charcoal-500 sm:text-xs">Revenue (paid)</p>
          </div>
        </RevealItem>
        <RevealItem>
          <div className="rounded-2xl border border-forest-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:p-6">
            <MotionIcon preset="pop" className="text-gold-700">
              <MessageSquare size={18} className="sm:hidden" />
              <MessageSquare size={22} className="hidden sm:block" />
            </MotionIcon>
            <p className="mt-2 font-display text-lg text-forest-950 sm:mt-3 sm:text-2xl">
              {unhandledMessages.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-charcoal-500 sm:text-xs">Unhandled messages</p>
          </div>
        </RevealItem>
      </RevealGroup>

      <Reveal className="mt-4 rounded-2xl border border-forest-100 bg-white p-4 sm:mt-6 sm:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500 sm:text-sm">
          Bookings by status
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <span
              key={status}
              className={`rounded-full px-3 py-1 text-xs font-medium sm:px-4 sm:py-1.5 sm:text-sm ${statusBadgeClass(status)}`}
            >
              {status}: {count}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-4 rounded-2xl border border-forest-100 bg-white sm:mt-6">
        <div className="flex items-center justify-between border-b border-forest-100 px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="font-display text-base text-forest-950 sm:text-lg">Recent bookings</h2>
          <Link
            href="/admin/bookings"
            className="text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800 hover:underline"
          >
            View all
          </Link>
        </div>

        {/* Card list on small screens */}
        <div className="divide-y divide-forest-50 sm:hidden">
          {recentBookings.map((b) => (
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
              <div className="flex items-center justify-between gap-2 text-sm text-charcoal-500">
                <span className="truncate">{b.guest_name}</span>
                <span className="shrink-0">{formatDate(b.travel_date)}</span>
              </div>
              <p className="text-sm font-medium text-forest-900">{formatINR(b.estimate_amount)}</p>
            </Link>
          ))}
        </div>

        {/* Table on larger screens */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-6 py-3">Booking</th>
                <th className="px-6 py-3">Guest</th>
                <th className="px-6 py-3">Travel date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                  <td className="px-6 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="font-medium text-forest-900 hover:text-gold-700">
                      {b.booking_code}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{b.guest_name}</td>
                  <td className="px-6 py-3">{formatDate(b.travel_date)}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{formatINR(b.estimate_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
