"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { countBookingsByPhone, createBooking, getBookingByCode, requestCancellation } from "@/lib/db/queries/bookings";
import { isValidPickupLocation } from "@/lib/db/queries/pickupLocations";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rateLimit";
import { quoteBooking } from "@/lib/pricing/service";
import { isValidE164 } from "@/lib/validation/phone";
import { isValidEmail } from "@/lib/validation/email";
import { strictPhone } from "@/lib/validation/zod";

function tripLength(startDate: string, endDate: string): { days: number; nights: number } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
  const days = diff + 1;
  return { days, nights: Math.max(0, days - 1) };
}

/** Called as the phone field loses focus — lets the form show a "this number already has bookings" confirm checkbox before submit. */
export async function checkPhoneBookingsAction(phone: string): Promise<{ count: number }> {
  if (!isValidE164(phone)) return { count: 0 };
  return { count: await countBookingsByPhone(phone) };
}

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
    phone: strictPhone(),
    email: z
      .string()
      .trim()
      .max(200)
      .refine((v) => v === "" || isValidEmail(v), { message: "Please enter a valid email address" })
      .optional()
      .or(z.literal("")),
    carType: z.string().trim().max(60).optional().or(z.literal("")),
    carDays: z.string().trim().optional().default("[]"),
    carNotes: z.string().trim().max(500).optional().or(z.literal("")),
    couponCode: z.string().trim().max(40).optional().or(z.literal("")),
    confirmDuplicate: z.enum(["true", "false"]).optional().default("false"),
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
    carType: formData.get("carType") ?? "",
    carDays: formData.get("carDays") ?? "[]",
    carNotes: formData.get("carNotes") ?? "",
    couponCode: formData.get("couponCode") ?? "",
    confirmDuplicate: formData.get("confirmDuplicate") ?? "false",
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message;
    return { ok: false, error: firstIssue || "Please check the form for errors." };
  }
  const data = parsed.data;

  if (!(await isValidPickupLocation(data.pickupLocation))) {
    return { ok: false, error: "Please choose a pickup location from the list." };
  }

  if (data.confirmDuplicate !== "true" && (await countBookingsByPhone(data.phone)) > 0) {
    return {
      ok: false,
      error: "This mobile number already has bookings with us — please check the confirmation box to continue.",
    };
  }

  let carDays: number[] = [];
  try {
    const raw = JSON.parse(data.carDays);
    if (Array.isArray(raw)) carDays = raw.filter((n) => Number.isInteger(n) && n > 0);
  } catch {
    carDays = [];
  }

  const { nights, days } = tripLength(data.startDate, data.endDate);
  const quote = await quoteBooking({
    packageSlug: data.packageSlug,
    nights,
    days,
    adults: data.adults,
    children: data.children,
    carType: data.carType || null,
    carDays,
    couponCode: data.couponCode || null,
  });
  if (!quote) {
    return { ok: false, error: "Please choose a valid travel package." };
  }

  const user = await getCurrentUser();

  const booking = await createBooking({
    guest_name: data.name,
    guest_phone: data.phone,
    guest_email: data.email || null,
    package_id: quote.packageId,
    destination: data.destination,
    travel_date: data.startDate,
    end_date: data.endDate,
    pickup_location: data.pickupLocation,
    adults: data.adults,
    children: data.children,
    estimate_amount: quote.total,
    coupon_code: quote.couponValid ? data.couponCode : null,
    customer_id: user && user.role === "customer" ? user.id : null,
    trip_type: "package",
    pricing_tier_id: quote.pricingTierId,
    car_type: data.carType || null,
    car_days: carDays,
    car_notes: data.carNotes || null,
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

  const booking = await getBookingByCode(code);
  if (!booking || booking.guest_phone !== phone) {
    return { ok: false, error: "We couldn't verify that booking — check the code and phone number." };
  }
  if (booking.status === "Completed" || booking.status === "Cancelled") {
    return { ok: false, error: `This booking is already ${booking.status.toLowerCase()}.` };
  }

  await requestCancellation(booking.id);
  return { ok: true };
}
