"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff, requireRole } from "@/lib/auth/rbac";
import {
  assignDriverAndVehicle,
  deleteBooking,
  getBookingById,
  setBookingCoupon,
  setExtraCharge,
  setFinalAmount,
  setItinerary,
  setPaymentStatus,
  setRemarks,
  updateBookingStatus,
} from "@/lib/db/queries/bookings";
import { getCouponByCode } from "@/lib/db/queries/coupons";
import { recordAuditLog } from "@/lib/db/queries/auditLogs";
import { sendBookingConfirmationSms } from "@/lib/notifications";
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

  const before = await getBookingById(id);
  await updateBookingStatus(id, status.data, note || undefined);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "update_status",
    entity_type: "booking",
    entity_id: id,
    meta: { status: status.data },
  });

  if (status.data === "Confirmed" && before && before.status !== "Confirmed") {
    const amount = before.final_amount ?? before.estimate_amount;
    try {
      await sendBookingConfirmationSms(before.guest_phone, before.booking_code, amount);
    } catch (err) {
      console.error(`Failed to send booking confirmation SMS for ${before.booking_code}:`, err);
    }
  }

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
  const fleetId = formData.get("fleetId") ? Number(formData.get("fleetId")) : null;
  if (!id) return { ok: false, error: "Invalid booking." };

  await assignDriverAndVehicle(id, driverId, vehicleNumber, fleetId);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "assign_driver",
    entity_type: "booking",
    entity_id: id,
    meta: { driverId, vehicleNumber, fleetId },
  });
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function setFinalAmountAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  const raw = String(formData.get("finalAmount") ?? "").trim();
  if (!id) return { ok: false, error: "Invalid booking." };

  const finalAmount = raw === "" ? null : Number(raw);
  if (finalAmount !== null && (!Number.isFinite(finalAmount) || finalAmount < 0)) {
    return { ok: false, error: "Enter a valid amount." };
  }

  await setFinalAmount(id, finalAmount);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "set_final_amount",
    entity_type: "booking",
    entity_id: id,
    meta: { finalAmount },
  });
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function setExtraChargeAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  const amount = Number(formData.get("amount") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!id || !Number.isFinite(amount) || amount < 0) return { ok: false, error: "Enter a valid amount." };

  await setExtraCharge(id, amount, note);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "set_extra_charge",
    entity_type: "booking",
    entity_id: id,
    meta: { amount, note },
  });
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function applyCouponAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  const code = String(formData.get("code") ?? "").trim();
  if (!id || !code) return { ok: false, error: "Enter a coupon code." };

  const coupon = await getCouponByCode(code);
  if (!coupon || coupon.active !== 1) return { ok: false, error: "That coupon isn't active." };

  const booking = await getBookingById(id);
  if (!booking) return { ok: false, error: "Booking not found." };

  const discount = Math.round(((booking.final_amount ?? booking.estimate_amount) * coupon.pct) / 100 / 10) * 10;
  await setBookingCoupon(id, coupon.code, discount);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "apply_coupon",
    entity_type: "booking",
    entity_id: id,
    meta: { code: coupon.code, discount },
  });
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

export async function removeCouponAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  if (!id) return { ok: false, error: "Invalid booking." };

  await setBookingCoupon(id, null, 0);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "remove_coupon",
    entity_type: "booking",
    entity_id: id,
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

  await setPaymentStatus(id, status.data);
  await recordAuditLog({
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

  await setRemarks(id, remarks);
  const booking = await getBookingById(id);
  await recordAuditLog({
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

  await setItinerary(id, parsed.data);
  const booking = await getBookingById(id);
  await recordAuditLog({
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

  const booking = await getBookingById(id);
  await deleteBooking(id);
  await recordAuditLog({
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
