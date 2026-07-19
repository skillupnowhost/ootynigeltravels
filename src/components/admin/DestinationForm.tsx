"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveDestinationAction, type AdminActionState } from "@/lib/actions/adminMedia";
import type { Destination } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";

const initial: AdminActionState = { ok: false };

export function DestinationForm({ destination, redirectOnSave = true }: { destination?: Destination; redirectOnSave?: boolean }) {
  const [state, formAction, pending] = useActionState(saveDestinationAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && redirectOnSave && !destination) router.push("/admin/destinations");
  }, [state.ok, redirectOnSave, destination, router]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-2xl border border-forest-100 bg-white p-4 sm:p-7">
      {destination && <input type="hidden" name="id" value={destination.id} />}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Slug"
          name="slug"
          defaultValue={destination?.slug ?? ""}
          placeholder="ooty-lake"
          disabled={Boolean(destination)}
        />
        <Field label="Name" name="name" defaultValue={destination?.name ?? ""} placeholder="Ooty Lake" />
        <Field label="Region" name="region" defaultValue={destination?.region ?? ""} required={false} />
        <Field
          label="Distance from Ooty"
          name="distance_from_ooty"
          defaultValue={destination?.distance_from_ooty ?? ""}
          placeholder="2 km"
          required={false}
        />
        <Field label="Best season" name="best_season" defaultValue={destination?.best_season ?? ""} required={false} />
        <Field
          label="Sort order"
          name="sort_order"
          type="number"
          defaultValue={destination?.sort_order ?? 0}
          required={false}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Description</label>
        <textarea
          name="description"
          defaultValue={destination?.description ?? ""}
          rows={4}
          className="input-field"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-forest-900">
        <input type="checkbox" name="active" defaultChecked={destination ? destination.active === 1 : true} className="h-4 w-4 accent-forest-700" />
        Active (visible on site)
      </label>

      {state.error && <p className="animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-6 py-3">
        {pending ? "Saving..." : "Save destination"}
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
  disabled = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
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
        disabled={disabled}
        className="input-field disabled:opacity-60"
      />
    </div>
  );
}
