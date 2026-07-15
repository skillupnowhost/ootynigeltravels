"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCustomerAction, type AdminActionState } from "@/lib/actions/adminUsers";
import { Button } from "@/components/ui/Button";

const initial: AdminActionState = { ok: false };

export function CustomerCreateForm() {
  const [state, formAction, pending] = useActionState(createCustomerAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-2xl border border-forest-100 bg-white p-4 sm:p-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Name</label>
        <input name="name" required className="input-field w-48" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Phone</label>
        <input name="phone" required className="input-field w-40" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Email</label>
        <input name="email" type="email" className="input-field w-48" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Password</label>
        <input name="password" type="password" required className="input-field w-40" />
      </div>
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-5 py-3">
        {pending ? "Adding..." : "Add customer"}
      </Button>
      {state.error && (
        <p className="w-full animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
