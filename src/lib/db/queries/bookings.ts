import { db, withTransaction } from "../client";
import { parseJsonColumns } from "../helpers";
import type { Booking, BookingHistoryEntry, BookingStatus, ItineraryDay, PaymentStatus, TripType } from "../types";

export function generateBookingCode(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ONT-${yy}${mm}${dd}-${rand}`;
}

function mapBooking(row: Record<string, unknown>): Booking {
  return parseJsonColumns<Booking>(row, ["itinerary", "car_days"]);
}

async function attachHistory(booking: Booking): Promise<Booking & { history: BookingHistoryEntry[] }> {
  const history = (await db
    .prepare("SELECT * FROM booking_history WHERE booking_id = ? ORDER BY created_at ASC")
    .all(booking.id)) as BookingHistoryEntry[];
  return { ...booking, history };
}

export interface CreateBookingInput {
  guest_name: string;
  guest_phone: string;
  guest_email?: string | null;
  package_id?: number | null;
  fleet_id?: number | null;
  destination: string;
  travel_date: string;
  end_date: string;
  pickup_location: string;
  pickup_time?: string | null;
  adults: number;
  children: number;
  estimate_amount: number;
  coupon_code?: string | null;
  customer_id?: number | null;
  trip_type?: TripType;
  pricing_tier_id?: number | null;
  car_type?: string | null;
  car_days?: number[];
  car_notes?: string | null;
}

export async function createBooking(
  input: CreateBookingInput
): Promise<Booking & { history: BookingHistoryEntry[] }> {
  const bookingCode = generateBookingCode();
  const booking = await withTransaction(async (tx) => {
    const row = await tx
      .prepare(
        `INSERT INTO bookings (booking_code, customer_id, guest_name, guest_phone, guest_email, package_id, fleet_id,
          destination, travel_date, end_date, pickup_location, pickup_time, adults, children, estimate_amount, coupon_code,
          trip_type, pricing_tier_id, car_type, car_days, car_notes)
         VALUES (@booking_code, @customer_id, @guest_name, @guest_phone, @guest_email, @package_id, @fleet_id,
          @destination, @travel_date, @end_date, @pickup_location, @pickup_time, @adults, @children, @estimate_amount, @coupon_code,
          @trip_type, @pricing_tier_id, @car_type, @car_days, @car_notes)
         RETURNING *`
      )
      .get({
        booking_code: bookingCode,
        customer_id: input.customer_id ?? null,
        guest_name: input.guest_name,
        guest_phone: input.guest_phone,
        guest_email: input.guest_email ?? null,
        package_id: input.package_id ?? null,
        fleet_id: input.fleet_id ?? null,
        destination: input.destination,
        travel_date: input.travel_date,
        end_date: input.end_date,
        pickup_location: input.pickup_location,
        pickup_time: input.pickup_time ?? null,
        adults: input.adults,
        children: input.children,
        estimate_amount: input.estimate_amount,
        coupon_code: input.coupon_code ?? null,
        trip_type: input.trip_type ?? "package",
        pricing_tier_id: input.pricing_tier_id ?? null,
        car_type: input.car_type ?? null,
        car_days: JSON.stringify(input.car_days ?? []),
        car_notes: input.car_notes ?? null,
      });

    await tx
      .prepare(
        `INSERT INTO booking_history (booking_id, status, note) VALUES (?, 'Pending', 'Booking received — our team will confirm shortly.')`
      )
      .run(row.id);

    return mapBooking(row);
  });

  return attachHistory(booking);
}

export async function setItinerary(id: number, itinerary: ItineraryDay[]): Promise<void> {
  await db.prepare(
    "UPDATE bookings SET itinerary = ?, updated_at = now() WHERE id = ?"
  ).run(JSON.stringify(itinerary), id);
}

export async function getBookingHistory(bookingId: number): Promise<BookingHistoryEntry[]> {
  return (await db
    .prepare("SELECT * FROM booking_history WHERE booking_id = ? ORDER BY created_at ASC")
    .all(bookingId)) as BookingHistoryEntry[];
}

export async function getBookingById(id: number): Promise<Booking | undefined> {
  const row = (await db.prepare("SELECT * FROM bookings WHERE id = ?").get(id)) as
    | Record<string, unknown>
    | undefined;
  return row ? mapBooking(row) : undefined;
}

export async function getBookingByCode(
  code: string
): Promise<(Booking & { history: BookingHistoryEntry[] }) | undefined> {
  const row = (await db
    .prepare("SELECT * FROM bookings WHERE UPPER(booking_code) = UPPER(?)")
    .get(code)) as Record<string, unknown> | undefined;
  return row ? attachHistory(mapBooking(row)) : undefined;
}

export async function listBookingsByPhone(
  phone: string
): Promise<(Booking & { history: BookingHistoryEntry[] })[]> {
  const rows = (await db
    .prepare("SELECT * FROM bookings WHERE guest_phone = ? ORDER BY created_at DESC")
    .all(phone)) as Record<string, unknown>[];
  return Promise.all(rows.map(mapBooking).map(attachHistory));
}

export async function countBookingsByPhone(phone: string): Promise<number> {
  const row = (await db.prepare("SELECT COUNT(*) as c FROM bookings WHERE guest_phone = ?").get(phone)) as {
    c: number;
  };
  return row.c;
}

export async function listBookingsForCustomer(
  customerId: number
): Promise<(Booking & { history: BookingHistoryEntry[] })[]> {
  const rows = (await db
    .prepare("SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC")
    .all(customerId)) as Record<string, unknown>[];
  return Promise.all(rows.map(mapBooking).map(attachHistory));
}

/**
 * Guest bookings are stored with a full E.164 phone (any country), but account
 * registration only collects a bare national number (no country picker there).
 * Matching on the last 10 digits keeps the "my past guest bookings appear in my
 * account" feature working across that format difference for Indian numbers.
 */
export async function linkBookingsToCustomer(phone: string, customerId: number): Promise<number> {
  const result = await db
    .prepare(
      `UPDATE bookings SET customer_id = ?
       WHERE customer_id IS NULL
       AND RIGHT(regexp_replace(guest_phone, '\\D', '', 'g'), 10) = RIGHT(regexp_replace(?, '\\D', '', 'g'), 10)`
    )
    .run(customerId, phone);
  return result.rowCount;
}

export interface BookingListFilters {
  status?: BookingStatus;
  search?: string;
  limit?: number;
}

export async function listAllBookings(filters: BookingListFilters = {}): Promise<Booking[]> {
  const clauses: string[] = [];
  const params: Record<string, unknown> = {};
  if (filters.status) {
    clauses.push("status = @status");
    params.status = filters.status;
  }
  if (filters.search) {
    clauses.push(
      "(guest_name ILIKE @search OR guest_phone ILIKE @search OR booking_code ILIKE @search)"
    );
    params.search = `%${filters.search}%`;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = filters.limit ? `LIMIT ${Number(filters.limit)}` : "";
  const rows = (await db
    .prepare(`SELECT * FROM bookings ${where} ORDER BY created_at DESC ${limit}`)
    .all(params)) as Record<string, unknown>[];
  return rows.map(mapBooking);
}

export async function updateBookingStatus(
  id: number,
  status: BookingStatus,
  note?: string
): Promise<void> {
  await db.prepare(
    "UPDATE bookings SET status = ?, updated_at = now() WHERE id = ?"
  ).run(status, id);
  await db.prepare(
    "INSERT INTO booking_history (booking_id, status, note) VALUES (?, ?, ?)"
  ).run(id, status, note ?? null);
}

export async function assignDriverAndVehicle(
  id: number,
  driverId: number | null,
  vehicleNumber: string | null,
  fleetId?: number | null
): Promise<void> {
  if (fleetId === undefined) {
    await db.prepare(
      `UPDATE bookings SET driver_id = ?, vehicle_number = ?, updated_at = now() WHERE id = ?`
    ).run(driverId, vehicleNumber, id);
    return;
  }
  await db.prepare(
    `UPDATE bookings SET driver_id = ?, vehicle_number = ?, fleet_id = ?, updated_at = now() WHERE id = ?`
  ).run(driverId, vehicleNumber, fleetId, id);
}

export async function setFinalAmount(id: number, finalAmount: number | null): Promise<void> {
  await db.prepare(
    "UPDATE bookings SET final_amount = ?, updated_at = now() WHERE id = ?"
  ).run(finalAmount, id);
}

export async function setExtraCharge(id: number, amount: number, note: string | null): Promise<void> {
  await db.prepare(
    "UPDATE bookings SET extra_charges = ?, extra_charges_note = ?, updated_at = now() WHERE id = ?"
  ).run(amount, note, id);
}

export async function setBookingCoupon(
  id: number,
  couponCode: string | null,
  discountAmount: number
): Promise<void> {
  await db.prepare(
    "UPDATE bookings SET coupon_code = ?, discount_amount = ?, updated_at = now() WHERE id = ?"
  ).run(couponCode, discountAmount, id);
}

export async function setPaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<void> {
  await db.prepare(
    `UPDATE bookings SET payment_status = ?, updated_at = now() WHERE id = ?`
  ).run(paymentStatus, id);
}

export async function setRemarks(id: number, remarks: string): Promise<void> {
  await db.prepare(
    `UPDATE bookings SET remarks = ?, updated_at = now() WHERE id = ?`
  ).run(remarks, id);
}

export async function requestCancellation(id: number): Promise<void> {
  await db.prepare("UPDATE bookings SET cancel_requested = 1 WHERE id = ?").run(id);
  await db.prepare(
    "INSERT INTO booking_history (booking_id, status, note) VALUES (?, (SELECT status FROM bookings WHERE id = ?), 'Guest requested cancellation via website.')"
  ).run(id, id);
}

export async function deleteBooking(id: number): Promise<void> {
  await db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
}

export async function popularPackages(limit = 5): Promise<{ name: string; count: number }[]> {
  return (await db
    .prepare(
      `SELECT p.name as name, COUNT(*) as count FROM bookings b
       JOIN packages p ON p.id = b.package_id
       GROUP BY p.id ORDER BY count DESC LIMIT ?`
    )
    .all(limit)) as { name: string; count: number }[];
}

export async function popularFleet(limit = 5): Promise<{ name: string; count: number }[]> {
  return (await db
    .prepare(
      `SELECT f.name as name, COUNT(*) as count FROM bookings b
       JOIN fleet f ON f.id = b.fleet_id
       GROUP BY f.id ORDER BY count DESC LIMIT ?`
    )
    .all(limit)) as { name: string; count: number }[];
}

export async function revenueByMonth(months = 6): Promise<{ month: string; revenue: number }[]> {
  return (await db
    .prepare(
      `SELECT to_char(travel_date, 'YYYY-MM') as month, COALESCE(SUM(estimate_amount),0) as revenue
       FROM bookings WHERE payment_status = 'Paid'
       GROUP BY month ORDER BY month DESC LIMIT ?`
    )
    .all(months)) as { month: string; revenue: number }[];
}

export async function bookingStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  revenue: number;
  upcoming7d: number;
}> {
  const total = ((await db.prepare("SELECT COUNT(*) as c FROM bookings").get()) as { c: number }).c;
  const rows = (await db
    .prepare("SELECT status, COUNT(*) as c FROM bookings GROUP BY status")
    .all()) as { status: string; c: number }[];
  const byStatus: Record<string, number> = {};
  for (const r of rows) byStatus[r.status] = r.c;
  const revenue = (
    (await db
      .prepare(
        "SELECT COALESCE(SUM(estimate_amount),0) as s FROM bookings WHERE payment_status = 'Paid'"
      )
      .get()) as { s: number }
  ).s;
  const upcoming7d = (
    (await db
      .prepare(
        "SELECT COUNT(*) as c FROM bookings WHERE travel_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 day'"
      )
      .get()) as { c: number }
  ).c;
  return { total, byStatus, revenue, upcoming7d };
}
