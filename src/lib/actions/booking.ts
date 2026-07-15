"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createBooking, getBookingByCode, requestCancellation } from "@/lib/db/queries/bookings";
import { packagesRepo } from "@/lib/db/queries/packages";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rateLimit";

const bookingSchema = z
  .object({
    destination: z.string().trim().min(2, "Destination is required").max(120),
    packageSlug: z.string().trim().min(1, "Please choose a package"),
    startDate: z.string().trim().min(1, "Start date is required"),
    endDate: z.string().trim().min(1, "End date is required"),
    pickupLocation: z.string().trim().min(2, "Pickup location is required").max(200),
    adults: z.coerce.number().int().min(1).max(30),
    children: z.coerce.number().int().min(0).max(20),
    name: z.string().trim().min(2).max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\-\s]{7,20}$/, "Enter a valid mobile number"),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type BookingFormState = {
  ok: boolean;
  error?: string;
  bookingCode?: string;
  estimate?: number;
};

function computeEstimate(basePrice: number, adults: number, children: number): number {
  const extraAdults = Math.max(0, adults - 2);
  const amount = basePrice + extraAdults * basePrice * 0.15 + children * basePrice * 0.08;
  return Math.round(amount / 10) * 10;
}

export async function createBookingAction(
  _prev: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const store = await headers();
  const key = `booking:${store.get("x-forwarded-for") ?? "local"}`;
  if (!rateLimit(key, 8, 60_000)) {
    return { ok: false, error: "Too many booking attempts — please try again in a minute." };
  }

  const parsed = bookingSchema.safeParse({
    destination: formData.get("destination"),
    packageSlug: formData.get("packageSlug"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    pickupLocation: formData.get("pickupLocation"),
    adults: formData.get("adults"),
    children: formData.get("children"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message;
    return { ok: false, error: firstIssue || "Please check the form for errors." };
  }
  const data = parsed.data;

  const pkg = packagesRepo.getBySlug(data.packageSlug);
  if (!pkg) {
    return { ok: false, error: "Please choose a valid travel package." };
  }

  const estimate = computeEstimate(pkg.price_from, data.adults, data.children);
  const user = await getCurrentUser();

  const booking = createBooking({
    guest_name: data.name,
    guest_phone: data.phone,
    guest_email: data.email || null,
    package_id: pkg.id,
    destination: data.destination,
    travel_date: data.startDate,
    end_date: data.endDate,
    pickup_location: data.pickupLocation,
    adults: data.adults,
    children: data.children,
    estimate_amount: estimate,
    customer_id: user && user.role === "customer" ? user.id : null,
  });

  return { ok: true, bookingCode: booking.booking_code, estimate: booking.estimate_amount };
}

export type CancelFormState = { ok: boolean; error?: string };

export async function requestCancellationAction(
  _prev: CancelFormState,
  formData: FormData
): Promise<CancelFormState> {
  const store = await headers();
  const key = `cancel:${store.get("x-forwarded-for") ?? "local"}`;
  if (!rateLimit(key, 10, 60_000)) {
    return { ok: false, error: "Too many attempts — please try again shortly." };
  }

  const code = String(formData.get("code") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!code || !phone) {
    return { ok: false, error: "Booking code and phone number are required." };
  }

  const booking = getBookingByCode(code);
  if (!booking || booking.guest_phone !== phone) {
    return { ok: false, error: "We couldn't verify that booking — check the code and phone number." };
  }
  if (booking.status === "Completed" || booking.status === "Cancelled") {
    return { ok: false, error: `This booking is already ${booking.status.toLowerCase()}.` };
  }

  requestCancellation(booking.id);
  return { ok: true };
}
