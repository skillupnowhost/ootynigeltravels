"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Search, AlertCircle, Phone, FileText, TriangleAlert } from "lucide-react";
import { requestCancellationAction, type CancelFormState } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { CarDriveIcon, MapPinDropIcon, ClockHandsIcon, CalendarCheckIcon } from "@/components/ui/AnimatedIcons";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { BOOKING_STATUSES } from "@/lib/db/types";
import type { Booking, BookingHistoryEntry, TripRequest } from "@/lib/db/types";

type TrackedBooking = Booking & { history: BookingHistoryEntry[] };

const cancelInitial: CancelFormState = { ok: false };

export function TrackClient() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("code") ?? "");
  const [bookings, setBookings] = useState<TrackedBooking[] | null>(null);
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    const param = /^ont-/i.test(trimmed) ? `code=${encodeURIComponent(trimmed)}` : `phone=${encodeURIComponent(trimmed)}`;
    try {
      const res = await fetch(`/api/track?${param}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setBookings(data.bookings);
      setTripRequests(data.tripRequests ?? []);
      if (data.bookings.length === 0 && (data.tripRequests ?? []).length === 0) {
        setError("No booking or trip request found — check the ID or phone number.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Booking ID (ONT-...) or phone number"
          className="input-field flex-1"
        />
        <Button type="submit" variant="gold" disabled={loading} icon={false}>
          <motion.span
            className="mr-2 inline-flex"
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={loading ? { duration: 0.8, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
          >
            <Search size={16} />
          </motion.span>
          {loading ? "Searching..." : "Track"}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="track-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle size={16} className="shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-8 space-y-6">
        <AnimatePresence mode="popLayout">
          {bookings?.map((b) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <BookingCard booking={b} />
            </motion.div>
          ))}
          {tripRequests.map((r) => (
            <motion.div
              key={`trip-request-${r.id}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <TripRequestCard request={r} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TripRequestCard({ request }: { request: TripRequest }) {
  return (
    <div className="rounded-3xl border border-forest-100 bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl text-forest-950">Custom trip request — {request.trip_type}</p>
          <p className="text-sm text-charcoal-500">Submitted {formatDate(request.created_at)}</p>
        </div>
        <span className="rounded-full bg-forest-900 px-4 py-1.5 text-xs font-semibold text-ivory-50">
          {request.status}
        </span>
      </div>

      {request.destinations.length > 0 && (
        <p className="mt-4 text-sm text-charcoal-700">Places: {request.destinations.join(", ")}</p>
      )}

      {request.quotation_amount != null ? (
        <div className="mt-4 rounded-2xl bg-gold-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-800">Quotation from our team</p>
          <p className="mt-1 font-display text-2xl text-forest-950">{formatINR(request.quotation_amount)}</p>
          {request.quotation_note && <p className="mt-1 text-sm text-charcoal-700">{request.quotation_note}</p>}
        </div>
      ) : (
        <p className="mt-4 text-sm text-charcoal-500">
          Quotation required — our team is reviewing your itinerary and will share pricing shortly.
        </p>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: TrackedBooking }) {
  const [state, formAction, pending] = useActionState(requestCancellationAction, cancelInitial);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const currentIndex = BOOKING_STATUSES.indexOf(booking.status as (typeof BOOKING_STATUSES)[number]);

  return (
    <div className="rounded-3xl border border-forest-100 bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl text-forest-950">{booking.booking_code}</p>
          <p className="text-sm text-charcoal-500">Booked {formatDate(booking.created_at)}</p>
        </div>
        <span className="rounded-full bg-forest-900 px-4 py-1.5 text-xs font-semibold text-ivory-50">
          {booking.status}
        </span>
      </div>

      {booking.status !== "Cancelled" && (
        <div className="relative mt-8">
          {currentIndex >= 0 && currentIndex < 5 && (
            <motion.div
              className="absolute -top-6 text-forest-800"
              style={{ left: `${(currentIndex / 4) * 100}%` }}
              initial={false}
              animate={{ left: `${(currentIndex / 4) * 100}%`, x: "-50%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <CarDriveIcon size={18} loop={booking.status !== "Completed"} />
            </motion.div>
          )}
          <div className="flex items-center gap-1">
            {BOOKING_STATUSES.slice(0, 5).map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-1 last:flex-none">
                <div
                  className={`h-2 flex-1 rounded-full ${i <= currentIndex ? "bg-forest-700" : "bg-forest-100"}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-charcoal-700 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarCheckIcon size={16} className="text-gold-700 shrink-0" loop={false} /> {formatDate(booking.travel_date)}
        </div>
        {booking.pickup_time && (
          <div className="flex items-center gap-2">
            <ClockHandsIcon size={16} className="text-gold-700 shrink-0" loop={false} /> {booking.pickup_time}
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPinDropIcon size={16} className="text-gold-700 shrink-0" loop={false} /> {booking.pickup_location}
        </div>
        {booking.vehicle_number && (
          <div className="flex items-center gap-2">
            <CarDriveIcon
              size={18}
              className="text-gold-700 shrink-0"
              loop={booking.status === "In Progress"}
            />
            {booking.vehicle_number}
          </div>
        )}
        <div className="flex items-center gap-2">
          <MotionIcon preset="tilt">
            <Phone size={16} className="text-gold-700 shrink-0" />
          </MotionIcon>
          {booking.guest_phone}
        </div>
      </div>

      <p className="mt-4 font-display text-lg text-forest-950">{formatINR(booking.estimate_amount)}</p>

      <Link
        href={`/track/${booking.booking_code}/document`}
        target="_blank"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-800 underline decoration-dotted underline-offset-4 hover:text-gold-700"
      >
        <FileText size={16} className="shrink-0" />
        View / download trip document (PDF)
      </Link>

      {booking.history.length > 0 && (
        <div className="mt-6 border-t border-forest-100 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">History</h3>
          <ul className="mt-3 space-y-2">
            {booking.history.map((h) => (
              <li key={h.id} className="text-xs text-charcoal-500">
                <span className="font-medium text-forest-900">{h.status}</span> — {h.note} ·{" "}
                {formatDateTime(h.created_at)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!booking.cancel_requested && booking.status !== "Completed" && booking.status !== "Cancelled" && (
        <form action={formAction} className="mt-6 border-t border-forest-100 pt-4">
          <input type="hidden" name="code" value={booking.booking_code} />
          <input type="hidden" name="phone" value={booking.guest_phone} />
          {state.error && <p className="mb-2 text-xs text-red-600">{state.error}</p>}
          {state.ok ? (
            <div className="space-y-2">
              <p className="text-xs text-forest-700">Cancellation requested — our team will follow up.</p>
              <Link
                href={`/track/${booking.booking_code}/document`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 underline decoration-dotted underline-offset-4 hover:text-gold-700"
              >
                <FileText size={13} className="shrink-0" />
                Download trip document (PDF)
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={pending}
              className="text-xs font-semibold text-charcoal-500 underline decoration-dotted hover:text-red-600"
            >
              {pending ? "Requesting..." : "Request cancellation"}
            </button>
          )}

          <AnimatePresence>
            {confirmOpen && (
              <CancelConfirmDialog
                bookingCode={booking.booking_code}
                pending={pending}
                onDismiss={() => setConfirmOpen(false)}
                onConfirm={() => setConfirmOpen(false)}
              />
            )}
          </AnimatePresence>
        </form>
      )}
      {booking.cancel_requested && (
        <p className="mt-6 border-t border-forest-100 pt-4 text-xs text-gold-700">
          Cancellation requested — awaiting confirmation from our team.
        </p>
      )}
    </div>
  );
}

function CancelConfirmDialog({
  bookingCode,
  pending,
  onDismiss,
  onConfirm,
}: {
  bookingCode: string;
  pending: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_32px_70px_-28px_rgba(11,59,46,0.5)]"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TriangleAlert size={20} />
        </div>
        <h3 id="cancel-dialog-title" className="mt-4 font-display text-lg text-forest-950">
          Cancel this trip?
        </h3>
        <p className="mt-1.5 text-sm text-charcoal-500">
          This will send a cancellation request for booking <span className="font-semibold text-forest-900">{bookingCode}</span>.
          Our team will follow up to confirm.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full px-4 py-2 text-sm font-semibold text-charcoal-500 hover:text-forest-900"
          >
            Keep booking
          </button>
          <button
            type="submit"
            disabled={pending}
            onClick={onConfirm}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "Requesting..." : "Yes, cancel trip"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
