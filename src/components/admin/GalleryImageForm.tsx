"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveGalleryImageAction, type AdminActionState } from "@/lib/actions/adminContent";
import type { GalleryImage } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GALLERY_CATEGORIES } from "@/lib/data/galleryCategories";

const initial: AdminActionState = { ok: false };

export function GalleryImageForm({ image }: { image?: GalleryImage }) {
  const [state, formAction, pending] = useActionState(saveGalleryImageAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/admin/gallery");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-2xl border border-forest-100 bg-white p-4 sm:p-7">
      {image && <input type="hidden" name="id" value={image.id} />}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Category</label>
          <GlassSelect
            name="category"
            defaultValue={image?.category ?? GALLERY_CATEGORIES[0].slug}
            options={GALLERY_CATEGORIES.map((c) => ({ value: c.slug, label: c.label }))}
          />
        </div>
        <Field
          label="Image path"
          name="src"
          defaultValue={image?.src ?? ""}
          placeholder="/images/gallery/ooty/1.jpg"
        />
        <Field label="Alt text" name="alt" defaultValue={image?.alt ?? ""} />
        <Field label="Sort order" name="sort_order" type="number" defaultValue={image?.sort_order ?? 0} required={false} />
      </div>

      <Field label="Caption" name="caption" defaultValue={image?.caption ?? ""} required={false} />
      <Field label="Credit" name="credit" defaultValue={image?.credit ?? ""} placeholder="Photo via Unsplash" required={false} />

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-forest-900">
          <input type="checkbox" name="featured" defaultChecked={image?.featured === 1} className="h-4 w-4 accent-forest-700" />
          Featured (hero tile for its category)
        </label>
        <label className="flex items-center gap-2 text-sm text-forest-900">
          <input type="checkbox" name="active" defaultChecked={image ? image.active === 1 : true} className="h-4 w-4 accent-forest-700" />
          Active (visible on site)
        </label>
      </div>

      {state.error && (
        <p className="animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-6 py-3">
        {pending ? "Saving..." : "Save image"}
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
