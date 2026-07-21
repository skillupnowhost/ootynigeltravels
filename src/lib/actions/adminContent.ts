"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/db/queries/auditLogs";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { packagesRepo } from "@/lib/db/queries/packages";
import { createDriver, updateDriver, deleteDriver } from "@/lib/db/queries/drivers";
import { createCoupon, setCouponActive, updateCoupon, deleteCoupon } from "@/lib/db/queries/coupons";
import {
  createGalleryImage,
  updateGalleryImage,
  removeGalleryImage,
  reorderGalleryImages,
} from "@/lib/db/queries/galleryImages";
import { GALLERY_CATEGORIES } from "@/lib/data/galleryCategories";
import { createPricingTier, deletePricingTier, updatePricingTier } from "@/lib/db/queries/pricingTiers";
import {
  createPickupLocation,
  deletePickupLocation,
  setPickupLocationActive,
  updatePickupLocation,
} from "@/lib/db/queries/pickupLocations";

export type AdminActionState = { ok: boolean; error?: string };

const MANAGE_ROLES = ["admin", "manager"] as const;

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------- Fleet ----------
const fleetSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  name: z.string().trim().min(2),
  category: z.string().trim().min(2),
  seats: z.coerce.number().int().min(1).max(60),
  luggage: z.string().trim().optional().or(z.literal("")),
  price_per_day: z.coerce.number().int().min(0),
  model_kind: z.enum(["3d", "photo", "icon"]),
  hero_asset: z.string().trim().optional().or(z.literal("")),
  active: z.coerce.boolean(),
});

export async function saveFleetAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = fleetSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    category: formData.get("category"),
    seats: formData.get("seats"),
    luggage: formData.get("luggage"),
    price_per_day: formData.get("price_per_day"),
    model_kind: formData.get("model_kind"),
    hero_asset: formData.get("hero_asset"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const fields = {
    ...parsed.data,
    luggage: parsed.data.luggage || null,
    hero_asset: parsed.data.hero_asset || null,
    active: parsed.data.active ? 1 : 0,
    gallery: lines(formData.get("gallery")),
    features: lines(formData.get("features")),
  };

  if (id) {
    await fleetRepo.update(id, fields);
  } else {
    await fleetRepo.create(fields);
  }
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: id ? "update" : "create",
    entity_type: "fleet",
    entity_id: id ?? parsed.data.slug,
  });
  revalidatePath("/admin/fleet");
  return { ok: true };
}

export async function deleteFleetAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await fleetRepo.remove(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "fleet", entity_id: id });
  revalidatePath("/admin/fleet");
}

// ---------- Packages ----------
const packageSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  name: z.string().trim().min(2),
  tagline: z.string().trim().optional().or(z.literal("")),
  summary: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  duration_label: z.string().trim().optional().or(z.literal("")),
  price_from: z.coerce.number().int().min(0),
  category: z.string().trim().optional().or(z.literal("")),
  active: z.coerce.boolean(),
  original_price: z.coerce.number().int().min(0).optional(),
  rating: z.coerce.number().min(0).max(5),
  review_count: z.coerce.number().int().min(0),
  max_group_size: z.coerce.number().int().min(0).optional(),
  duration_days: z.coerce.number().int().min(0).optional(),
  distance_label: z.string().trim().optional().or(z.literal("")),
  pickup_drop: z.string().trim().optional().or(z.literal("")),
  driver_info: z.string().trim().optional().or(z.literal("")),
  best_time: z.string().trim().optional().or(z.literal("")),
});

export async function savePackageAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = packageSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    duration_label: formData.get("duration_label"),
    price_from: formData.get("price_from"),
    category: formData.get("category"),
    active: formData.get("active") === "on",
    original_price: formData.get("original_price") || undefined,
    rating: formData.get("rating"),
    review_count: formData.get("review_count"),
    max_group_size: formData.get("max_group_size") || undefined,
    duration_days: formData.get("duration_days") || undefined,
    distance_label: formData.get("distance_label"),
    pickup_drop: formData.get("pickup_drop"),
    driver_info: formData.get("driver_info"),
    best_time: formData.get("best_time"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  let itinerary: unknown = [];
  let faqs: unknown = [];
  try {
    itinerary = JSON.parse(String(formData.get("itinerary") || "[]"));
    faqs = JSON.parse(String(formData.get("faqs") || "[]"));
  } catch {
    return { ok: false, error: "Itinerary / FAQs must be valid JSON." };
  }

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const fields = {
    ...parsed.data,
    tagline: parsed.data.tagline || null,
    summary: parsed.data.summary || null,
    description: parsed.data.description || null,
    duration_label: parsed.data.duration_label || null,
    category: parsed.data.category || null,
    active: parsed.data.active ? 1 : 0,
    original_price: parsed.data.original_price ?? null,
    max_group_size: parsed.data.max_group_size ?? null,
    duration_days: parsed.data.duration_days ?? null,
    distance_label: parsed.data.distance_label || null,
    pickup_drop: parsed.data.pickup_drop || null,
    driver_info: parsed.data.driver_info || null,
    best_time: parsed.data.best_time || null,
    itinerary,
    faqs,
    includes: lines(formData.get("includes")),
    excludes: lines(formData.get("excludes")),
    highlights: lines(formData.get("highlights")),
    gallery: lines(formData.get("gallery")),
    vehicle_options: lines(formData.get("vehicle_options")),
    places_covered: lines(formData.get("places_covered")),
  };

  if (id) {
    await packagesRepo.update(id, fields);
  } else {
    await packagesRepo.create(fields);
  }
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: id ? "update" : "create",
    entity_type: "package",
    entity_id: id ?? parsed.data.slug,
  });
  revalidatePath("/admin/packages");
  return { ok: true };
}

export async function deletePackageAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await packagesRepo.remove(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "package", entity_id: id });
  revalidatePath("/admin/packages");
}

// ---------- Drivers ----------
const driverSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  name: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  license_no: z.string().trim().optional().or(z.literal("")),
  experience_years: z.coerce.number().int().min(0).max(60),
  rating: z.coerce.number().min(1).max(5),
  bio: z.string().trim().optional().or(z.literal("")),
  active: z.coerce.boolean(),
});

export async function saveDriverAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = driverSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    license_no: formData.get("license_no"),
    experience_years: formData.get("experience_years"),
    rating: formData.get("rating"),
    bio: formData.get("bio"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const fields = {
    ...parsed.data,
    license_no: parsed.data.license_no || null,
    bio: parsed.data.bio || null,
    photo: null,
    languages: lines(formData.get("languages")),
  };

  if (id) {
    await updateDriver(id, fields);
  } else {
    await createDriver(fields);
  }
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: id ? "update" : "create",
    entity_type: "driver",
    entity_id: id ?? parsed.data.slug,
  });
  revalidatePath("/admin/drivers");
  return { ok: true };
}

export async function deleteDriverAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await deleteDriver(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "driver", entity_id: id });
  revalidatePath("/admin/drivers");
}

// ---------- Coupons ----------
const couponSchema = z.object({
  code: z.string().trim().min(3).max(30),
  pct: z.coerce.number().int().min(1).max(90),
  note: z.string().trim().optional().or(z.literal("")),
});

export async function createCouponAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    pct: formData.get("pct"),
    note: formData.get("note"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const coupon = await createCoupon({ code: parsed.data.code, pct: parsed.data.pct, note: parsed.data.note || null });
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "create", entity_type: "coupon", entity_id: coupon.id });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function updateCouponAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    pct: formData.get("pct"),
    note: formData.get("note"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const id = Number(formData.get("id"));
  await updateCoupon(id, { code: parsed.data.code, pct: parsed.data.pct, note: parsed.data.note || null });
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "update", entity_type: "coupon", entity_id: id });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCouponAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "1";
  await setCouponActive(id, !active);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: active ? "deactivate" : "activate",
    entity_type: "coupon",
    entity_id: id,
  });
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await deleteCoupon(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "coupon", entity_id: id });
  revalidatePath("/admin/coupons");
}

// ---------- Gallery Images ----------
const galleryCategorySlugs = GALLERY_CATEGORIES.map((c) => c.slug) as [string, ...string[]];

const gallerySchema = z.object({
  category: z.enum(galleryCategorySlugs),
  src: z.string().trim().min(1, "Image path is required"),
  alt: z.string().trim().min(2, "Alt text is required"),
  caption: z.string().trim().optional().or(z.literal("")),
  credit: z.string().trim().optional().or(z.literal("")),
  featured: z.coerce.boolean(),
  active: z.coerce.boolean(),
  sort_order: z.coerce.number().int(),
});

export async function saveGalleryImageAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = gallerySchema.safeParse({
    category: formData.get("category"),
    src: formData.get("src"),
    alt: formData.get("alt"),
    caption: formData.get("caption"),
    credit: formData.get("credit"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    sort_order: formData.get("sort_order") || 0,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const fields = {
    category: parsed.data.category,
    src: parsed.data.src,
    alt: parsed.data.alt,
    caption: parsed.data.caption || null,
    credit: parsed.data.credit || null,
    featured: parsed.data.featured ? 1 : 0,
    active: parsed.data.active ? 1 : 0,
    sort_order: parsed.data.sort_order,
  };

  if (id) {
    await updateGalleryImage(id, fields);
  } else {
    await createGalleryImage(fields);
  }
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: id ? "update" : "create",
    entity_type: "gallery_image",
    entity_id: id ?? parsed.data.src,
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true };
}

export async function deleteGalleryImageAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await removeGalleryImage(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "gallery_image", entity_id: id });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function reorderGalleryImagesAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const category = String(formData.get("category") || "");
  const orderedIds = String(formData.get("ordered_ids") || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  if (!category || orderedIds.length === 0) return;
  await reorderGalleryImages(category, orderedIds);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "reorder", entity_type: "gallery_image", entity_id: category });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

// ---------- Package pricing tiers ----------
const pricingTierSchema = z.object({
  package_id: z.coerce.number().int().min(1),
  nights: z.coerce.number().int().min(0).max(60),
  days: z.coerce.number().int().min(1).max(60),
  price: z.coerce.number().int().min(0),
});

export async function createPricingTierAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = pricingTierSchema.safeParse({
    package_id: formData.get("package_id"),
    nights: formData.get("nights"),
    days: formData.get("days"),
    price: formData.get("price"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const tier = await createPricingTier(parsed.data);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "create", entity_type: "pricing_tier", entity_id: tier.id });
  revalidatePath(`/admin/packages/${parsed.data.package_id}`);
  return { ok: true };
}

export async function deletePricingTierAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  const packageId = Number(formData.get("package_id"));
  await deletePricingTier(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "pricing_tier", entity_id: id });
  revalidatePath(`/admin/packages/${packageId}`);
}

export async function updatePricingTierAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  const packageId = Number(formData.get("package_id"));
  const parsed = z
    .object({ nights: z.coerce.number().int().min(0).max(60), days: z.coerce.number().int().min(1).max(60), price: z.coerce.number().int().min(0) })
    .safeParse({ nights: formData.get("nights"), days: formData.get("days"), price: formData.get("price") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await updatePricingTier(id, parsed.data);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "update", entity_type: "pricing_tier", entity_id: id });
  revalidatePath(`/admin/packages/${packageId}`);
  return { ok: true };
}

// ---------- Pickup locations ----------
const pickupLocationSchema = z.object({
  city: z.string().trim().min(2).max(60),
  label: z.string().trim().min(2).max(120),
});

export async function createPickupLocationAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = pickupLocationSchema.safeParse({ city: formData.get("city"), label: formData.get("label") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const location = await createPickupLocation(parsed.data);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "create", entity_type: "pickup_location", entity_id: location.id });
  revalidatePath("/admin/pickup-locations");
  return { ok: true };
}

export async function updatePickupLocationAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const user = await requireRole([...MANAGE_ROLES]);
  const parsed = pickupLocationSchema.safeParse({ city: formData.get("city"), label: formData.get("label") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const id = Number(formData.get("id"));
  await updatePickupLocation(id, parsed.data);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "update", entity_type: "pickup_location", entity_id: id });
  revalidatePath("/admin/pickup-locations");
  return { ok: true };
}

export async function togglePickupLocationAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "1";
  await setPickupLocationActive(id, !active);
  await recordAuditLog({
    actor_user_id: user.id,
    actor_name: user.name,
    action: active ? "deactivate" : "activate",
    entity_type: "pickup_location",
    entity_id: id,
  });
  revalidatePath("/admin/pickup-locations");
}

export async function deletePickupLocationAction(formData: FormData): Promise<void> {
  const user = await requireRole([...MANAGE_ROLES]);
  const id = Number(formData.get("id"));
  await deletePickupLocation(id);
  await recordAuditLog({ actor_user_id: user.id, actor_name: user.name, action: "delete", entity_type: "pickup_location", entity_id: id });
  revalidatePath("/admin/pickup-locations");
}
