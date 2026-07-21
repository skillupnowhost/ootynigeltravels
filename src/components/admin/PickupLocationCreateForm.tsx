"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPickupLocationAction, type AdminActionState } from "@/lib/actions/adminContent";
import { Button } from "@/components/ui/Button";

const initial: AdminActionState = { ok: false };

export function PickupLocationCreateForm() {
  const [state, formAction, pending] = useActionState(createPickupLocationAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-2xl border border-forest-100 bg-white p-4 sm:p-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">City</label>
        <input name="city" required placeholder="Coimbatore" className="input-field w-40" />
      </div>
      <div className="flex-1 min-w-[220px]">
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Pickup point label</label>
        <input name="label" required placeholder="Coimbatore Airport" className="input-field" />
      </div>
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-5 py-3">
        {pending ? "Adding..." : "Add pickup point"}
      </Button>
      {state.error && (
        <p className="w-full animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
