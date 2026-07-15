"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/db/queries/auditLogs";
import { deleteReview, setReviewApproved } from "@/lib/db/queries/reviews";
import { setMessageHandled, deleteContactMessage } from "@/lib/db/queries/contactMessages";
import { setTripRequestStatus, deleteTripRequest } from "@/lib/db/queries/tripRequests";
import { TRIP_REQUEST_STATUSES, type TripRequestStatus } from "@/lib/db/types";

const MANAGE_ROLES = ["admin", "manager"] as const;

export async function approveReviewAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  setReviewApproved(id, true);
  recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "approve", entity_type: "review", entity_id: id });
  revalidatePath("/admin/reviews");
}

export async function rejectReviewAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  setReviewApproved(id, false);
  recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "reject", entity_type: "review", entity_id: id });
  revalidatePath("/admin/reviews");
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  deleteReview(id);
  recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "review", entity_id: id });
  revalidatePath("/admin/reviews");
}

export async function markMessageHandledAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  const handled = formData.get("handled") === "1";
  setMessageHandled(id, !handled);
  recordAuditLog({
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
  deleteContactMessage(id);
  recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "contact_message", entity_id: id });
  revalidatePath("/admin/messages");
}

export async function cycleTripRequestStatusAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES, "staff"]);
  const id = Number(formData.get("id"));
  const nextStatusRaw = String(formData.get("nextStatus"));
  if (!TRIP_REQUEST_STATUSES.includes(nextStatusRaw as TripRequestStatus)) return;
  const nextStatus = nextStatusRaw as TripRequestStatus;
  setTripRequestStatus(id, nextStatus);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: `status:${nextStatus}`,
    entity_type: "trip_request",
    entity_id: id,
  });
  revalidatePath("/admin/trip-requests");
}

export async function deleteTripRequestAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  deleteTripRequest(id);
  recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "trip_request", entity_id: id });
  revalidatePath("/admin/trip-requests");
}
