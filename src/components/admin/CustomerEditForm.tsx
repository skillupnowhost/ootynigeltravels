"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCustomerAction, type AdminActionState } from "@/lib/actions/adminUsers";
import type { User } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";

const initial: AdminActionState = { ok: false };

export function CustomerEditForm({ customer }: { customer: User }) {
  const [state, formAction, pending] = useActionState(updateCustomerAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/admin/customers");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="max-w-lg space-y-5 rounded-2xl border border-forest-100 bg-white p-4 sm:p-7">
      <input type="hidden" name="id" value={customer.id} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Name</label>
        <input name="name" defaultValue={customer.name} required className="input-field" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Phone</label>
        <input name="phone" defaultValue={customer.phone} required className="input-field" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Email</label>
        <input name="email" type="email" defaultValue={customer.email ?? ""} className="input-field" />
      </div>

      {state.error && (
        <p className="animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-6 py-3">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
