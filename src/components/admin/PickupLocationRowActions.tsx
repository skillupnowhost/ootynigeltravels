"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import { updatePickupLocationAction, deletePickupLocationAction, type AdminActionState } from "@/lib/actions/adminContent";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { PickupLocation } from "@/lib/db/types";

const initial: AdminActionState = { ok: false };

export function PickupLocationRowActions({ location }: { location: PickupLocation }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updatePickupLocationAction, initial);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) setEditing(false);
    wasPending.current = pending;
  }, [pending, state.error]);

  if (editing) {
    return (
      <form action={formAction} className="flex flex-wrap items-center justify-end gap-2">
        <input type="hidden" name="id" value={location.id} />
        <input name="city" defaultValue={location.city} required className="input-field w-28 py-1.5 text-xs" />
        <input name="label" defaultValue={location.label} required className="input-field w-40 py-1.5 text-xs" />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-forest-900 px-2.5 py-1.5 text-xs font-semibold text-ivory-50 hover:bg-forest-800 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="rounded-lg p-1.5 text-charcoal-500 hover:bg-ivory-100" aria-label="Cancel edit">
          <X size={16} />
        </button>
        {state.error && <p className="w-full text-right text-xs text-red-600">{state.error}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg p-1.5 text-charcoal-500 transition-colors duration-200 hover:bg-forest-50 hover:text-forest-900"
        aria-label={`Edit ${location.label}`}
      >
        <Pencil size={16} />
      </button>
      <DeleteButton action={deletePickupLocationAction} id={location.id} confirmLabel={`Delete pickup point "${location.label}"?`} />
    </div>
  );
}
