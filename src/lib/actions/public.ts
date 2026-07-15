"use server";

import { z } from "zod";
import { createContactMessage } from "@/lib/db/queries/contactMessages";
import { createReview } from "@/lib/db/queries/reviews";
import { createTripRequest } from "@/lib/db/queries/tripRequests";
import { rateLimit } from "@/lib/auth/rateLimit";
import { headers } from "next/headers";
import type { TripRequest } from "@/lib/db/types";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
});

export type ContactFormState = { ok: boolean; error?: string };

async function clientKey() {
  const store = await headers();
  return store.get("x-forwarded-for") ?? "local";
}

export async function submitContactMessage(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const key = `contact:${await clientKey()}`;
  if (!rateLimit(key, 5, 60_000)) {
    return { ok: false, error: "Too many messages sent — please try again in a minute." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please check the form — some fields look invalid." };
  }

  createContactMessage({
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  return { ok: true };
}

const reviewSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(2000),
});

export type ReviewFormState = { ok: boolean; error?: string };

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const key = `review:${await clientKey()}`;
  if (!rateLimit(key, 5, 60_000)) {
    return { ok: false, error: "Too many submissions — please try again shortly." };
  }

  const parsed = reviewSchema.safeParse({
    customer_name: formData.get("customer_name"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please check the form — a name, rating and comment are required." };
  }

  createReview({
    customer_name: parsed.data.customer_name,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    source: "website",
    approved: false, // held for admin moderation before it appears publicly
  });

  return { ok: true };
}

const tripRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  trip_type: z.string().trim().min(1).max(40),
  destinations: z.array(z.string().trim().min(1)).max(30),
  group_size: z.coerce.number().int().min(1).max(60),
  duration_label: z.string().trim().max(60).optional().or(z.literal("")),
  travel_month: z.string().trim().max(40).optional().or(z.literal("")),
  budget_range: z.string().trim().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  package_slug: z.string().trim().max(120).optional().or(z.literal("")),
  vehicle_type: z.string().trim().max(80).optional().or(z.literal("")),
  hotel_category: z.string().trim().max(40).optional().or(z.literal("")),
  computed_total: z.coerce.number().int().min(0).optional(),
});

export type TripRequestFormState = { ok: boolean; error?: string; request?: TripRequest };

export async function submitTripRequest(
  _prev: TripRequestFormState,
  formData: FormData
): Promise<TripRequestFormState> {
  const key = `trip-request:${await clientKey()}`;
  if (!rateLimit(key, 5, 60_000)) {
    return { ok: false, error: "Too many requests sent — please try again in a minute." };
  }

  const parsed = tripRequestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    trip_type: formData.get("trip_type"),
    destinations: formData.getAll("destinations"),
    group_size: formData.get("group_size"),
    duration_label: formData.get("duration_label"),
    travel_month: formData.get("travel_month"),
    budget_range: formData.get("budget_range"),
    notes: formData.get("notes"),
    package_slug: formData.get("package_slug"),
    vehicle_type: formData.get("vehicle_type"),
    hotel_category: formData.get("hotel_category"),
    computed_total: formData.get("computed_total") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Please check the form — some fields look invalid." };
  }

  const request = createTripRequest({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    trip_type: parsed.data.trip_type,
    destinations: parsed.data.destinations,
    group_size: parsed.data.group_size,
    duration_label: parsed.data.duration_label || null,
    travel_month: parsed.data.travel_month || null,
    budget_range: parsed.data.budget_range || null,
    notes: parsed.data.notes || null,
    package_slug: parsed.data.package_slug || null,
    vehicle_type: parsed.data.vehicle_type || null,
    hotel_category: parsed.data.hotel_category || null,
    computed_total: parsed.data.computed_total ?? null,
  });

  return { ok: true, request };
}
