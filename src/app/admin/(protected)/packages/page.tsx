import Link from "next/link";
import { Plus } from "lucide-react";
import { packagesRepo } from "@/lib/db/queries/packages";
import { formatINR } from "@/lib/format";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePackageAction } from "@/lib/actions/adminContent";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  await requireRole(["admin", "manager"]);
  const packages = await packagesRepo.list();

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Packages</h1>
          <Link
            href="/admin/packages/new"
            className="flex items-center gap-1.5 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800"
          >
            <MotionIcon preset="pop">
              <Plus size={16} />
            </MotionIcon>
            Add package
          </Link>
        </div>

        {/* Card list on small screens */}
        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {packages.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href={`/admin/packages/${p.id}`} className="min-w-0">
                <p className="font-medium text-forest-900">{p.name}</p>
                <p className="text-sm text-charcoal-500">
                  {p.category} · {formatINR(p.price_from)}
                </p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${p.active ? "bg-forest-100 text-forest-800" : "bg-ivory-200 text-charcoal-500"}`}>
                  {p.active ? "Active" : "Hidden"}
                </span>
              </Link>
              <DeleteButton action={deletePackageAction} id={p.id} confirmLabel={`Delete ${p.name}?`} />
            </div>
          ))}
        </div>

        {/* Table on larger screens */}
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price from</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/packages/${p.id}`} className="font-medium text-forest-900 hover:text-gold-700">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{p.category}</td>
                  <td className="px-5 py-3">{formatINR(p.price_from)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.active ? "bg-forest-100 text-forest-800" : "bg-ivory-200 text-charcoal-500"}`}>
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DeleteButton action={deletePackageAction} id={p.id} confirmLabel={`Delete ${p.name}?`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
