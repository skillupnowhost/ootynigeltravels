import Link from "next/link";
import { listCustomers } from "@/lib/db/queries/users";
import { listBookingsForCustomer } from "@/lib/db/queries/bookings";
import { deleteCustomerAction } from "@/lib/actions/adminUsers";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CustomerCreateForm } from "@/components/admin/CustomerCreateForm";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { HeartBeatIcon } from "@/components/ui/AnimatedIcons";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireRole(["admin", "manager"]);
  const customers = await listCustomers();
  const bookingCounts = new Map<number, number>(
    await Promise.all(
      customers.map(async (c) => [c.id, (await listBookingsForCustomer(c.id)).length] as const)
    )
  );

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <HeartBeatIcon size={24} className="text-gold-700" loop={false} />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Customers</h1>
        </div>
        <p className="mt-1 text-sm text-charcoal-500">
          Registered accounts only — most bookings come from guests who never create one.
        </p>

        <div className="mt-4 sm:mt-6">
          <CustomerCreateForm />
        </div>

        {/* Card list on small screens */}
        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {customers.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href={`/admin/customers/${c.id}`} className="min-w-0">
                <p className="font-medium text-forest-900">{c.name}</p>
                <p className="truncate text-sm text-charcoal-500">
                  {c.phone} {c.email ? `· ${c.email}` : ""}
                </p>
                <p className="text-xs text-charcoal-500">
                  Joined {formatDate(c.created_at)} · {bookingCounts.get(c.id) ?? 0} bookings
                </p>
              </Link>
              <DeleteButton action={deleteCustomerAction} id={c.id} confirmLabel={`Delete customer ${c.name}? Their past bookings will be kept but unlinked.`} />
            </div>
          ))}
          {customers.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-charcoal-500">No registered customers yet.</p>
          )}
        </div>

        {/* Table on larger screens */}
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Bookings</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="font-medium text-forest-900 hover:text-gold-700">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{c.phone}</td>
                  <td className="px-5 py-3">{c.email ?? "—"}</td>
                  <td className="px-5 py-3">{formatDate(c.created_at)}</td>
                  <td className="px-5 py-3">{bookingCounts.get(c.id) ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    <DeleteButton action={deleteCustomerAction} id={c.id} confirmLabel={`Delete customer ${c.name}? Their past bookings will be kept but unlinked.`} />
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-charcoal-500">
                    No registered customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
