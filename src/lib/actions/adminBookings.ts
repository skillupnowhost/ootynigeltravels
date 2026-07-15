"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff, requireRole } from "@/lib/auth/rbac";
import {
  assignDriverAndVehicle,
  deleteBooking,
  getBookingById,
  setItinerary,
  setPaymentStatus,
  setRemarks,
  updateBookingStatus,
} from "@/lib/db/queries/bookings";
import { recordAuditLog } from "@/lib/db/queries/auditLogs";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@/lib/db/types";

const itineraryDaySchema = z.object({
  day: z.coerce.number().int().min(1),
  title: z.string().trim().min(1, "Each day needs a title."),
  description: z.string().trim().optional().default(""),
});
const itinerarySchema = z.array(itineraryDaySchema).max(60);

export type AdminActionState = { ok: boolean; error?: string };

export async function updateBookingStatusAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  const status = z.enum(BOOKING_STATUSES).safeParse(formData.get("status"));
  const note = String(formData.get("note") ?? "");
  if (!id || !status.success) return { ok: false, error: "Invalid status." };

  updateBookingStatus(id, status.data, note || undefined);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "update_status",
    entity_type: "booking",
    entity_id: id,
    meta: { status: status.data },
  });
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function assignDriverAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  const driverId = formData.get("driverId") ? Number(formData.get("driverId")) : null;
  const vehicleNumber = String(formData.get("vehicleNumber") ?? "").trim() || null;
  if (!id) return { ok: false, error: "Invalid booking." };

  assignDriverAndVehicle(id, driverId, vehicleNumber);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "assign_driver",
    entity_type: "booking",
    entity_id: id,
    meta: { driverId, vehicleNumber },
  });
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function setPaymentStatusAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  const status = z.enum(PAYMENT_STATUSES).safeParse(formData.get("paymentStatus"));
  if (!id || !status.success) return { ok: false, error: "Invalid payment status." };

  setPaymentStatus(id, status.data);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "set_payment_status",
    entity_type: "booking",
    entity_id: id,
    meta: { status: status.data },
  });
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function setRemarksAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  const remarks = String(formData.get("remarks") ?? "");
  if (!id) return { ok: false, error: "Invalid booking." };

  setRemarks(id, remarks);
  const booking = getBookingById(id);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "set_remarks",
    entity_type: "booking",
    entity_id: id,
    meta: { bookingCode: booking?.booking_code },
  });
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function setItineraryAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  if (!id) return { ok: false, error: "Invalid booking." };

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("itinerary") || "[]"));
  } catch {
    return { ok: false, error: "Itinerary data was malformed." };
  }
  const parsed = itinerarySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid itinerary." };

  setItinerary(id, parsed.data);
  const booking = getBookingById(id);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "set_itinerary",
    entity_type: "booking",
    entity_id: id,
    meta: { bookingCode: booking?.booking_code, days: parsed.data.length },
  });
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function deleteBookingAction(formData: FormData): Promise<void> {
  const user = await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  const booking = getBookingById(id);
  deleteBooking(id);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "delete",
    entity_type: "booking",
    entity_id: id,
    meta: { bookingCode: booking?.booking_code },
  });
  revalidatePath("/admin/bookings");
  redirect("/admin/bookings");
}
