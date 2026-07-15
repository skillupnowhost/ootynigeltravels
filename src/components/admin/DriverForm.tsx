"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveDriverAction, type AdminActionState } from "@/lib/actions/adminContent";
import type { Driver } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";

const initial: AdminActionState = { ok: false };

export function DriverForm({ driver }: { driver?: Driver }) {
  const [state, formAction, pending] = useActionState(saveDriverAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/admin/drivers");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-2xl border border-forest-100 bg-white p-4 sm:p-7">
      {driver && <input type="hidden" name="id" value={driver.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug" name="slug" defaultValue={driver?.slug} />
        <Field label="Name" name="name" defaultValue={driver?.name} />
        <Field label="Phone" name="phone" defaultValue={driver?.phone} />
        <Field label="License no." name="license_no" defaultValue={driver?.license_no ?? ""} required={false} />
        <Field label="Experience (years)" name="experience_years" type="number" defaultValue={driver?.experience_years} />
        <Field label="Rating (1-5)" name="rating" type="number" defaultValue={driver?.rating ?? 4.8} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Languages (one per line)</label>
        <textarea name="languages" rows={3} defaultValue={driver?.languages.join("\n")} className="input-field" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Bio</label>
        <textarea name="bio" rows={3} defaultValue={driver?.bio ?? ""} className="input-field" />
      </div>
      <label className="flex items-center gap-2 text-sm text-forest-900">
        <input type="checkbox" name="active" defaultChecked={driver ? driver.active === 1 : true} className="h-4 w-4 accent-forest-700" />
        Active
      </label>

      {state.error && (
        <p className="animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-6 py-3">
        {pending ? "Saving..." : "Save driver"}
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
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} required={required} className="input-field" />
    </div>
  );
}
