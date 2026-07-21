"use client";

import { useActionState } from "react";
import { sendQuotationAction, type AdminActionState } from "@/lib/actions/adminModeration";

const initial: AdminActionState = { ok: false };

export function QuotationForm({
  id,
  defaultAmount,
  defaultNote,
}: {
  id: number;
  defaultAmount: number | null;
  defaultNote: string | null;
}) {
  const [state, formAction, pending] = useActionState(sendQuotationAction, initial);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-xl border border-forest-100 bg-forest-50/40 p-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-forest-500">Amount (₹)</label>
        <input name="amount" type="number" min={0} defaultValue={defaultAmount ?? ""} required className="input-field w-32 py-1.5 text-xs" />
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-forest-500">Note</label>
        <input name="note" defaultValue={defaultNote ?? ""} placeholder="What's included" className="input-field py-1.5 text-xs" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-forest-900 px-3 py-1.5 text-xs font-semibold text-ivory-50 hover:bg-forest-800 disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send quotation"}
      </button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
      {state.ok && <p className="w-full text-xs font-medium text-forest-700">✓ Quotation sent.</p>}
    </form>
  );
}
