import type { Booking } from "@/lib/db/types";

export type TripBucket = "upcoming" | "current" | "previous";

export function classifyTrip(booking: Booking, now: Date = new Date()): TripBucket {
  if (booking.status === "Completed" || booking.status === "Cancelled") return "previous";

  const start = new Date(booking.travel_date);
  const end = booking.end_date ? new Date(booking.end_date) : start;

  if (end < now) return "previous";
  if (start <= now && now <= end) return "current";
  return "upcoming";
}

export function bucketTrips(bookings: Booking[], now: Date = new Date()) {
  const buckets: Record<TripBucket, Booking[]> = { upcoming: [], current: [], previous: [] };
  for (const b of bookings) buckets[classifyTrip(b, now)].push(b);
  return buckets;
}
