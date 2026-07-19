"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { savePackageAction, type AdminActionState } from "@/lib/actions/adminContent";
import type { TourPackage } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";

const initial: AdminActionState = { ok: false };

const CATEGORY_OPTIONS = [
  "Family",
  "Couple",
  "Honeymoon",
  "Friends",
  "Adventure",
  "Group",
  "Weekend",
  "Wildlife",
  "NatureTea",
  "HillStation",
  "Luxury",
  "Budget",
  "Corporate",
  "Student",
];

export function PackageForm({ pkg }: { pkg?: TourPackage }) {
  const [state, formAction, pending] = useActionState(savePackageAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/admin/packages");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="max-w-3xl space-y-6 rounded-2xl border border-forest-100 bg-white p-4 sm:p-7">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Slug" name="slug" defaultValue={pkg?.slug} />
        <Field label="Name" name="name" defaultValue={pkg?.name} />
        <Field label="Tagline" name="tagline" defaultValue={pkg?.tagline ?? ""} required={false} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Category</label>
          <GlassSelect
            name="category"
            defaultValue={pkg?.category ?? "Family"}
            options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <Field label="Duration label" name="duration_label" defaultValue={pkg?.duration_label ?? ""} required={false} />
        <Field label="Duration (days)" name="duration_days" type="number" defaultValue={pkg?.duration_days ?? undefined} required={false} />
        <Field label="Price from (INR)" name="price_from" type="number" defaultValue={pkg?.price_from} />
        <Field label="Original price (INR, optional)" name="original_price" type="number" defaultValue={pkg?.original_price ?? undefined} required={false} />
        <Field label="Rating (0-5)" name="rating" type="number" step="0.1" defaultValue={pkg?.rating ?? 4.8} />
        <Field label="Review count" name="review_count" type="number" defaultValue={pkg?.review_count ?? 0} />
        <Field label="Max group size" name="max_group_size" type="number" defaultValue={pkg?.max_group_size ?? undefined} required={false} />
        <Field label="Travel distance" name="distance_label" defaultValue={pkg?.distance_label ?? ""} required={false} />
        <Field label="Pickup & drop" name="pickup_drop" defaultValue={pkg?.pickup_drop ?? ""} required={false} />
        <Field label="Best time to visit" name="best_time" defaultValue={pkg?.best_time ?? ""} required={false} />
      </div>

      <TextArea label="Summary" name="summary" defaultValue={pkg?.summary ?? ""} rows={2} />
      <TextArea label="Description" name="description" defaultValue={pkg?.description ?? ""} rows={4} />
      <TextArea label="Driver info" name="driver_info" defaultValue={pkg?.driver_info ?? ""} rows={2} />
      <TextArea label="Gallery image paths (one per line, e.g. /images/packages/Family/1.jpg)" name="gallery" defaultValue={pkg?.gallery.join("\n")} rows={3} />
      <TextArea label="Vehicle options (one per line, matching fleet categories)" name="vehicle_options" defaultValue={pkg?.vehicle_options.join("\n")} rows={2} />
      <TextArea label="Places covered (one per line)" name="places_covered" defaultValue={pkg?.places_covered.join("\n")} rows={3} />
      <TextArea label="Includes (one per line)" name="includes" defaultValue={pkg?.includes.join("\n")} rows={3} />
      <TextArea label="Excludes (one per line)" name="excludes" defaultValue={pkg?.excludes.join("\n")} rows={3} />
      <TextArea label="Highlights (one per line)" name="highlights" defaultValue={pkg?.highlights.join("\n")} rows={3} />
      <TextArea
        label='Itinerary (JSON array of {"day","title","description"})'
        name="itinerary"
        defaultValue={JSON.stringify(pkg?.itinerary ?? [], null, 2)}
        rows={6}
        mono
      />
      <TextArea
        label='FAQs (JSON array of {"question","answer"})'
        name="faqs"
        defaultValue={JSON.stringify(pkg?.faqs ?? [], null, 2)}
        rows={4}
        mono
      />

      <label className="flex items-center gap-2 text-sm text-forest-900">
        <input type="checkbox" name="active" defaultChecked={pkg ? pkg.active === 1 : true} className="h-4 w-4 accent-forest-700" />
        Active (visible on site)
      </label>

      {state.error && (
        <p className="animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-6 py-3">
        {pending ? "Saving..." : "Save package"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = true,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>
      <input name={name} type={type} step={step} defaultValue={defaultValue} required={required} className="input-field" />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
  mono = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className={`input-field ${mono ? "font-mono text-xs" : ""}`}
      />
    </div>
  );
}
