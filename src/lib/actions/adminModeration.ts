"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/db/queries/auditLogs";
import { deleteReview, setReviewApproved } from "@/lib/db/queries/reviews";
import { setMessageHandled, deleteContactMessage } from "@/lib/db/queries/contactMessages";
import { setTripRequestStatus, deleteTripRequest, sendQuotation, getTripRequestById } from "@/lib/db/queries/tripRequests";
import { sendSms } from "@/lib/sms";
import { TRIP_REQUEST_STATUSES, type TripRequestStatus } from "@/lib/db/types";

export type AdminActionState = { ok: boolean; error?: string };

const MANAGE_ROLES = ["admin", "manager"] as const;

export async function approveReviewAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await setReviewApproved(id, true);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "approve", entity_type: "review", entity_id: id });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function rejectReviewAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await setReviewApproved(id, false);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "reject", entity_type: "review", entity_id: id });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await deleteReview(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "review", entity_id: id });
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

export async function markMessageHandledAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  const handled = formData.get("handled") === "1";
  await setMessageHandled(id, !handled);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: handled ? "reopen" : "resolve",
    entity_type: "contact_message",
    entity_id: id,
  });
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await deleteContactMessage(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "contact_message", entity_id: id });
  revalidatePath("/admin/messages");
}

export async function cycleTripRequestStatusAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES, "staff"]);
  const id = Number(formData.get("id"));
  const nextStatusRaw = String(formData.get("nextStatus"));
  if (!TRIP_REQUEST_STATUSES.includes(nextStatusRaw as TripRequestStatus)) return;
  const nextStatus = nextStatusRaw as TripRequestStatus;
  await setTripRequestStatus(id, nextStatus);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: `status:${nextStatus}`,
    entity_type: "trip_request",
    entity_id: id,
  });
  revalidatePath("/admin/trip-requests");
}

const quotationSchema = z.object({
  amount: z.coerce.number().int().min(0),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function sendQuotationAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES, "staff"]);
  const id = Number(formData.get("id"));
  const parsed = quotationSchema.safeParse({ amount: formData.get("amount"), note: formData.get("note") });
  if (!id || !parsed.success) return { ok: false, error: parsed.error?.issues[0]?.message ?? "Invalid request." };

  await sendQuotation(id, parsed.data.amount, parsed.data.note || null);
  const request = await getTripRequestById(id);
  if (request) {
    try {
      await sendSms(
        request.phone,
        `Your custom trip quotation from Ooty Naigal Travels is ready: ₹${parsed.data.amount.toLocaleString("en-IN")}. Check your account or reply to confirm.`
      );
    } catch (err) {
      console.error(`Failed to send quotation SMS for trip request ${id}:`, err);
    }
  }
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "send_quotation",
    entity_type: "trip_request",
    entity_id: id,
    meta: { amount: parsed.data.amount },
  });
  revalidatePath("/admin/trip-requests");
  return { ok: true };
}

export async function deleteTripRequestAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await deleteTripRequest(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "trip_request", entity_id: id });
  revalidatePath("/admin/trip-requests");
}
