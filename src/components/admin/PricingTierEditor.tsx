"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import {
  createPricingTierAction,
  deletePricingTierAction,
  updatePricingTierAction,
  type AdminActionState,
} from "@/lib/actions/adminContent";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatINR } from "@/lib/format";
import type { PackagePricingTier } from "@/lib/db/types";

const initial: AdminActionState = { ok: false };

export function PricingTierEditor({ packageId, tiers }: { packageId: number; tiers: PackagePricingTier[] }) {
  const [state, formAction, pending] = useActionState(createPricingTierAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <div className="rounded-2xl border border-forest-100 bg-white p-4 sm:p-6">
      <h2 className="font-display text-lg text-forest-950">Nights / days pricing tiers</h2>
      <p className="mt-1 text-sm text-charcoal-500">
        When a customer&apos;s dates match one of these, the tier price is used instead of the base &ldquo;starting
        from&rdquo; price. Leave empty to always use the base price.
      </p>

      <div className="mt-4 divide-y divide-forest-50">
        {tiers.map((tier) => (
          <TierRow key={tier.id} tier={tier} packageId={packageId} />
        ))}
        {tiers.length === 0 && <p className="py-3 text-sm text-charcoal-500">No tiers yet — base price applies.</p>}
      </div>

      <form ref={formRef} action={formAction} className="mt-4 flex flex-wrap items-end gap-3 border-t border-forest-100 pt-4">
        <input type="hidden" name="package_id" value={packageId} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Nights</label>
          <input name="nights" type="number" min={0} max={60} required className="input-field w-24" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Days</label>
          <input name="days" type="number" min={1} max={60} required className="input-field w-24" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Price (₹)</label>
          <input name="price" type="number" min={0} required className="input-field w-32" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors hover:bg-gold-600 hover:text-forest-950 disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add tier"}
        </button>
        {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      </form>
    </div>
  );
}

function TierRow({ tier, packageId }: { tier: PackagePricingTier; packageId: number }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updatePricingTierAction, initial);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) setEditing(false);
    wasPending.current = pending;
  }, [pending, state.error]);

  if (editing) {
    return (
      <form action={formAction} className="flex flex-wrap items-center gap-2 py-3">
        <input type="hidden" name="id" value={tier.id} />
        <input type="hidden" name="package_id" value={packageId} />
        <input name="nights" type="number" min={0} max={60} defaultValue={tier.nights} required className="input-field w-20 py-1.5 text-xs" />
        <input name="days" type="number" min={1} max={60} defaultValue={tier.days} required className="input-field w-20 py-1.5 text-xs" />
        <input name="price" type="number" min={0} defaultValue={tier.price} required className="input-field w-28 py-1.5 text-xs" />
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
        {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 py-3">
      <p className="text-sm text-forest-900">
        {tier.nights} Night{tier.nights === 1 ? "" : "s"} / {tier.days} Day{tier.days === 1 ? "" : "s"}
        <span className="ml-3 font-semibold text-forest-950">{formatINR(tier.price)}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg p-1.5 text-charcoal-500 transition-colors duration-200 hover:bg-forest-50 hover:text-forest-900"
          aria-label="Edit tier"
        >
          <Pencil size={16} />
        </button>
        <DeleteButton
          action={async (fd) => {
            fd.set("package_id", String(packageId));
            await deletePricingTierAction(fd);
          }}
          id={tier.id}
          confirmLabel={`Delete the ${tier.nights}N/${tier.days}D tier?`}
        />
      </div>
    </div>
  );
}
