import Link from "next/link";
import { Plus } from "lucide-react";
import { listDrivers } from "@/lib/db/queries/drivers";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteDriverAction } from "@/lib/actions/adminContent";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";

export const dynamic = "force-dynamic";

export default async function AdminDriversPage() {
  await requireRole(["admin", "manager"]);
  const drivers = listDrivers();

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Drivers</h1>
          <Link
            href="/admin/drivers/new"
            className="flex items-center gap-1.5 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800"
          >
            <MotionIcon preset="pop">
              <Plus size={16} />
            </MotionIcon>
            Add driver
          </Link>
        </div>

        {/* Card list on small screens */}
        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {drivers.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href={`/admin/drivers/${d.id}`} className="min-w-0">
                <p className="font-medium text-forest-900">{d.name}</p>
                <p className="text-sm text-charcoal-500">{d.phone}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal-500">
                  <span>{d.experience_years} yrs</span>
                  <span className="flex items-center gap-1">
                    <GlowStarIcon size={12} className="text-gold-500" loop={false} />
                    {d.rating.toFixed(1)}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${d.active ? "bg-forest-100 text-forest-800" : "bg-ivory-200 text-charcoal-500"}`}>
                    {d.active ? "Active" : "Hidden"}
                  </span>
                </div>
              </Link>
              <DeleteButton action={deleteDriverAction} id={d.id} confirmLabel={`Delete ${d.name}?`} />
            </div>
          ))}
        </div>

        {/* Table on larger screens */}
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Experience</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/drivers/${d.id}`} className="font-medium text-forest-900 hover:text-gold-700">
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{d.phone}</td>
                  <td className="px-5 py-3">{d.experience_years} yrs</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1">
                      <GlowStarIcon size={14} className="text-gold-500" loop={false} />
                      {d.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${d.active ? "bg-forest-100 text-forest-800" : "bg-ivory-200 text-charcoal-500"}`}>
                      {d.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DeleteButton action={deleteDriverAction} id={d.id} confirmLabel={`Delete ${d.name}?`} />
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
