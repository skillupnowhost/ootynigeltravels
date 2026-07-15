import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { listStaffUsers, countByRole } from "@/lib/db/queries/users";
import { StaffUserForm } from "@/components/admin/StaffUserForm";
import { deleteStaffUserAction } from "@/lib/actions/adminUsers";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";

export const dynamic = "force-dynamic";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-gold-200 text-gold-900",
  manager: "bg-forest-100 text-forest-800",
  staff: "bg-ivory-200 text-charcoal-700",
};

export default async function AdminUsersPage() {
  const actor = await requireRole(["admin"]);
  const users = await listStaffUsers();
  const adminCount = await countByRole("admin");

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <MotionIcon preset="pop" className="text-gold-700">
            <ShieldCheck size={24} />
          </MotionIcon>
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Staff Users</h1>
        </div>

        <div className="mt-4 sm:mt-6">
          <StaffUserForm />
        </div>

        {/* Card list on small screens */}
        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {users.map((u) => {
            const canDelete = u.id !== actor.id && !(u.role === "admin" && adminCount <= 1);
            return (
              <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <Link href={`/admin/users/${u.id}`} className="min-w-0">
                  <p className="font-medium text-forest-900">{u.name}</p>
                  <p className="text-sm text-charcoal-500">{u.phone}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_STYLES[u.role] ?? "bg-forest-100 text-forest-800"}`}>
                      {u.role}
                    </span>
                    <span className="text-xs text-charcoal-500">{formatDate(u.created_at)}</span>
                  </div>
                </Link>
                {canDelete && (
                  <DeleteButton action={deleteStaffUserAction} id={u.id} confirmLabel={`Delete staff user ${u.name}?`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Table on larger screens */}
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const canDelete = u.id !== actor.id && !(u.role === "admin" && adminCount <= 1);
                return (
                  <tr key={u.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${u.id}`} className="font-medium text-forest-900 hover:text-gold-700">
                        {u.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{u.phone}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ROLE_STYLES[u.role] ?? "bg-forest-100 text-forest-800"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      {canDelete && (
                        <DeleteButton action={deleteStaffUserAction} id={u.id} confirmLabel={`Delete staff user ${u.name}?`} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
