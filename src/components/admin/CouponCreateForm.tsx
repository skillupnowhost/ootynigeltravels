"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCouponAction, type AdminActionState } from "@/lib/actions/adminContent";
import { Button } from "@/components/ui/Button";

const initial: AdminActionState = { ok: false };

export function CouponCreateForm() {
  const [state, formAction, pending] = useActionState(createCouponAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-2xl border border-forest-100 bg-white p-4 sm:p-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Code</label>
        <input name="code" required placeholder="WELCOME10" className="input-field w-40 uppercase" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Discount %</label>
        <input name="pct" type="number" min={1} max={90} required className="input-field w-28" />
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Note</label>
        <input name="note" className="input-field" />
      </div>
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-5 py-3">
        {pending ? "Adding..." : "Add coupon"}
      </Button>
      {state.error && (
        <p className="w-full animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
