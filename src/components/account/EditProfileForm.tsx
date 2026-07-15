"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateProfileAction, type AuthFormState } from "@/lib/actions/account";
import { Button } from "@/components/ui/Button";
import type { User } from "@/lib/db/types";

const initial: AuthFormState = { ok: false };

export function EditProfileForm({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor="name">
          Full name
        </label>
        <input id="name" name="name" defaultValue={user.name} required className="input-field" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor="phone">
          Phone number
        </label>
        <input id="phone" name="phone" type="tel" defaultValue={user.phone} required className="input-field" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" defaultValue={user.email ?? ""} className="input-field" />
      </div>

      {state.error && (
        <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl bg-forest-50 px-3 py-2 text-sm text-forest-700">
          <CheckCircle2 size={16} className="shrink-0" />
          Profile updated.
        </p>
      )}
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-6 py-3">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
