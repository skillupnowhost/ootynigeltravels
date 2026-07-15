"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/db/queries/auditLogs";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import {
  listDestinationImages,
  createDestinationImage,
  updateDestinationImage,
  removeDestinationImage,
  reorderDestinationImages,
} from "@/lib/db/queries/destinationImages";
import { attractionsRepo } from "@/lib/db/queries/attractions";
import {
  listAttractionImages,
  createAttractionImage,
  updateAttractionImage,
  removeAttractionImage,
  reorderAttractionImages,
} from "@/lib/db/queries/attractionImages";
import { ATTRACTION_CATEGORIES } from "@/lib/data/attractionCategories";

export type AdminActionState = { ok: boolean; error?: string };

const MANAGE_ROLES = ["admin", "manager"] as const;

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function saveUploadedFile(file: File, section: "destinations" | "attractions", slug: string): Promise<string> {
  const ext = ALLOWED_MIME_EXT[file.type];
  if (!ext) throw new Error("Only JPEG, PNG or WebP images are allowed.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image must be 5MB or smaller.");

  const dir = path.join(process.cwd(), "public", "uploads", section, slug);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${section}/${slug}/${filename}`;
}

// ---------- Destinations (card text fields) ----------
const destinationSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  name: z.string().trim().min(2),
  region: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  best_season: z.string().trim().optional().or(z.literal("")),
  distance_from_ooty: z.string().trim().optional().or(z.literal("")),
  sort_order: z.coerce.number().int(),
  active: z.coerce.boolean(),
});

export async function saveDestinationAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = destinationSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    region: formData.get("region"),
    description: formData.get("description"),
    best_season: formData.get("best_season"),
    distance_from_ooty: formData.get("distance_from_ooty"),
    sort_order: formData.get("sort_order") || 0,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const fields = {
    ...parsed.data,
    region: parsed.data.region || null,
    description: parsed.data.description || null,
    best_season: parsed.data.best_season || null,
    distance_from_ooty: parsed.data.distance_from_ooty || null,
    active: parsed.data.active ? 1 : 0,
  };

  if (id) {
    destinationsRepo.update(id, fields);
  } else {
    destinationsRepo.create(fields);
  }
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: id ? "update" : "create",
    entity_type: "destination",
    entity_id: id ?? parsed.data.slug,
  });
  revalidatePath("/admin/destinations");
  revalidatePath("/");
  revalidatePath("/destinations");
  return { ok: true };
}

export async function deleteDestinationAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  destinationsRepo.remove(id);
  recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "destination", entity_id: id });
  revalidatePath("/admin/destinations");
  revalidatePath("/");
  revalidatePath("/destinations");
}

// ---------- Destination images ----------
export async function uploadDestinationImageAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const destinationId = Number(formData.get("destination_id"));
  const destination = destinationsRepo.getById(destinationId);
  if (!destination) return { ok: false, error: "Destination not found." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image file." };

  let src: string;
  try {
    src = await saveUploadedFile(file, "destinations", destination.slug);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Upload failed." };
  }

  const alt = String(formData.get("alt") || "").trim() || `${destination.name} — Ooty Nigel Travels`;
  const existing = listDestinationImages(destinationId);
  const image = createDestinationImage({
    destination_id: destinationId,
    src,
    alt,
    sort_order: existing.length,
  });
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "upload",
    entity_type: "destination_image",
    entity_id: image.id,
  });
  revalidatePath("/admin/destinations");
  revalidatePath("/");
  return { ok: true };
}

const destinationImageEditSchema = z.object({
  id: z.coerce.number().int(),
  alt: z.string().trim().min(2, "Alt text is required"),
  active: z.coerce.boolean(),
});

export async function updateDestinationImageAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = destinationImageEditSchema.safeParse({
    id: formData.get("id"),
    alt: formData.get("alt"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  updateDestinationImage(parsed.data.id, { alt: parsed.data.alt, active: parsed.data.active ? 1 : 0 });
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "update",
    entity_type: "destination_image",
    entity_id: parsed.data.id,
  });
  revalidatePath("/admin/destinations");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteDestinationImageAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  removeDestinationImage(id);
  recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "destination_image", entity_id: id });
  revalidatePath("/admin/destinations");
  revalidatePath("/");
}

export async function reorderDestinationImagesAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const destinationId = Number(formData.get("destination_id"));
  const orderedIds = String(formData.get("ordered_ids") || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  reorderDestinationImages(destinationId, orderedIds);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "reorder",
    entity_type: "destination_image",
    entity_id: destinationId,
  });
  revalidatePath("/admin/destinations");
  revalidatePath("/");
}

// ---------- Hidden gems / attractions (card text fields) ----------
const attractionCategorySlugs = ATTRACTION_CATEGORIES as unknown as [string, ...string[]];

const attractionSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  name: z.string().trim().min(2),
  category: z.enum(attractionCategorySlugs),
  blurb: z.string().trim().optional().or(z.literal("")),
  sort_order: z.coerce.number().int(),
  active: z.coerce.boolean(),
});

export async function saveAttractionAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = attractionSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    category: formData.get("category"),
    blurb: formData.get("blurb"),
    sort_order: formData.get("sort_order") || 0,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const fields = {
    ...parsed.data,
    blurb: parsed.data.blurb || null,
    active: parsed.data.active ? 1 : 0,
  };

  if (id) {
    attractionsRepo.update(id, fields);
  } else {
    attractionsRepo.create(fields);
  }
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: id ? "update" : "create",
    entity_type: "attraction",
    entity_id: id ?? parsed.data.slug,
  });
  revalidatePath("/admin/hidden-gems");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteAttractionAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  attractionsRepo.remove(id);
  recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "attraction", entity_id: id });
  revalidatePath("/admin/hidden-gems");
  revalidatePath("/");
}

// ---------- Attraction images ----------
export async function uploadAttractionImageAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const attractionId = Number(formData.get("attraction_id"));
  const attraction = attractionsRepo.getById(attractionId);
  if (!attraction) return { ok: false, error: "Hidden gem not found." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image file." };

  let src: string;
  try {
    src = await saveUploadedFile(file, "attractions", attraction.slug);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Upload failed." };
  }

  const alt = String(formData.get("alt") || "").trim() || `${attraction.name} — Ooty Nigel Travels`;
  const existing = listAttractionImages(attractionId);
  const image = createAttractionImage({
    attraction_id: attractionId,
    src,
    alt,
    sort_order: existing.length,
  });
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "upload",
    entity_type: "attraction_image",
    entity_id: image.id,
  });
  revalidatePath("/admin/hidden-gems");
  revalidatePath("/");
  return { ok: true };
}

const attractionImageEditSchema = z.object({
  id: z.coerce.number().int(),
  alt: z.string().trim().min(2, "Alt text is required"),
  active: z.coerce.boolean(),
});

export async function updateAttractionImageAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = attractionImageEditSchema.safeParse({
    id: formData.get("id"),
    alt: formData.get("alt"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  updateAttractionImage(parsed.data.id, { alt: parsed.data.alt, active: parsed.data.active ? 1 : 0 });
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "update",
    entity_type: "attraction_image",
    entity_id: parsed.data.id,
  });
  revalidatePath("/admin/hidden-gems");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteAttractionImageAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  removeAttractionImage(id);
  recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "attraction_image", entity_id: id });
  revalidatePath("/admin/hidden-gems");
  revalidatePath("/");
}

export async function reorderAttractionImagesAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const attractionId = Number(formData.get("attraction_id"));
  const orderedIds = String(formData.get("ordered_ids") || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  reorderAttractionImages(attractionId, orderedIds);
  recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: "reorder",
    entity_type: "attraction_image",
    entity_id: attractionId,
  });
  revalidatePath("/admin/hidden-gems");
  revalidatePath("/");
}
