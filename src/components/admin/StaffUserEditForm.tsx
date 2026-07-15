"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { updateStaffUserAction, type AdminActionState } from "@/lib/actions/adminUsers";
import type { User } from "@/lib/db/types";
import { Button } from "@/components/ui/Button";
import { GlassSelect } from "@/components/ui/GlassSelect";

const initial: AdminActionState = { ok: false };

export function StaffUserEditForm({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(updateStaffUserAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.push("/admin/users");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="max-w-lg space-y-5 rounded-2xl border border-forest-100 bg-white p-4 sm:p-7">
      <input type="hidden" name="id" value={user.id} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Name</label>
        <input name="name" defaultValue={user.name} required className="input-field" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Phone</label>
        <input name="phone" defaultValue={user.phone} required className="input-field" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Role</label>
        <GlassSelect
          name="role"
          defaultValue={user.role}
          options={[
            { value: "staff", label: "Staff" },
            { value: "manager", label: "Manager" },
            { value: "admin", label: "Admin" },
          ]}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">New password (optional)</label>
        <input name="password" type="password" placeholder="Leave blank to keep current password" className="input-field" />
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
