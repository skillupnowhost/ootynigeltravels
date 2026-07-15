"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAttractionAction, type AdminActionState } from "@/lib/actions/adminMedia";
import type { Attraction } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { ATTRACTION_CATEGORIES } from "@/lib/data/attractionCategories";

const initial: AdminActionState = { ok: false };

export function AttractionForm({ attraction, redirectOnSave = true }: { attraction?: Attraction; redirectOnSave?: boolean }) {
  const [state, formAction, pending] = useActionState(saveAttractionAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && redirectOnSave && !attraction) router.push("/admin/hidden-gems");
  }, [state.ok, redirectOnSave, attraction, router]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-2xl border border-forest-100 bg-white p-4 sm:p-7">
      {attraction && <input type="hidden" name="id" value={attraction.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Slug"
          name="slug"
          defaultValue={attraction?.slug ?? ""}
          placeholder="doddabetta-peak"
          disabled={Boolean(attraction)}
        />
        <Field label="Name" name="name" defaultValue={attraction?.name ?? ""} placeholder="Doddabetta Peak" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Category</label>
          <GlassSelect
            name="category"
            defaultValue={attraction?.category ?? ATTRACTION_CATEGORIES[0]}
            options={ATTRACTION_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <Field
          label="Sort order"
          name="sort_order"
          type="number"
          defaultValue={attraction?.sort_order ?? 0}
          required={false}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Blurb</label>
        <textarea name="blurb" defaultValue={attraction?.blurb ?? ""} rows={3} className="input-field" />
      </div>

      <label className="flex items-center gap-2 text-sm text-forest-900">
        <input type="checkbox" name="active" defaultChecked={attraction ? attraction.active === 1 : true} className="h-4 w-4 accent-forest-700" />
        Active (visible on site)
      </label>

      {state.error && <p className="animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-6 py-3">
        {pending ? "Saving..." : "Save hidden gem"}
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
