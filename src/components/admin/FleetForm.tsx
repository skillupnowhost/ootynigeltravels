"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { saveFleetAction, type AdminActionState } from "@/lib/actions/adminContent";
import type { FleetVehicle } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";

const initial: AdminActionState = { ok: false };

export function FleetForm({ vehicle }: { vehicle?: FleetVehicle }) {
  const [state, formAction, pending] = useActionState(saveFleetAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/admin/fleet");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-2xl border border-forest-100 bg-white p-4 sm:p-7">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Slug" name="slug" defaultValue={vehicle?.slug} placeholder="mercedes-gls-580" />
        <Field label="Name" name="name" defaultValue={vehicle?.name} />
        <Field label="Category" name="category" defaultValue={vehicle?.category} />
        <Field label="Seats" name="seats" type="number" defaultValue={vehicle?.seats} />
        <Field label="Luggage" name="luggage" defaultValue={vehicle?.luggage ?? ""} required={false} />
        <Field label="Price per day (INR)" name="price_per_day" type="number" defaultValue={vehicle?.price_per_day} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Display type</label>
          <GlassSelect
            name="model_kind"
            defaultValue={vehicle?.model_kind ?? "icon"}
            options={[
              { value: "icon", label: "Icon" },
              { value: "photo", label: "Photo gallery" },
              { value: "3d", label: "3D (homepage hero only)" },
            ]}
          />
        </div>
        <Field label="Hero asset path" name="hero_asset" defaultValue={vehicle?.hero_asset ?? ""} placeholder="/images/fleet/..." required={false} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Gallery images (one path per line)</label>
        <textarea name="gallery" rows={3} defaultValue={vehicle?.gallery.join("\n")} className="input-field" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Features (one per line)</label>
        <textarea name="features" rows={3} defaultValue={vehicle?.features.join("\n")} className="input-field" />
      </div>

      <label className="flex items-center gap-2 text-sm text-forest-900">
        <input type="checkbox" name="active" defaultChecked={vehicle ? vehicle.active === 1 : true} className="h-4 w-4 accent-forest-700" />
        Active (visible on site)
      </label>

      {state.error && (
        <p className="animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-6 py-3">
        {pending ? "Saving..." : "Save vehicle"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="input-field"
      />
    </div>
  );
}
