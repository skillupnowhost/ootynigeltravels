import { listCoupons } from "@/lib/db/queries/coupons";
import { CouponCreateForm } from "@/components/admin/CouponCreateForm";
import { CouponRowActions } from "@/components/admin/CouponRowActions";
import { toggleCouponAction } from "@/lib/actions/adminContent";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireRole(["admin", "manager"]);
  const coupons = listCoupons();

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Coupons</h1>

        <div className="mt-4 sm:mt-6">
          <CouponCreateForm />
        </div>

        {/* Card list on small screens */}
        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {coupons.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-forest-900">{c.code}</span>
                <span className="text-sm font-semibold text-forest-900">{c.pct}%</span>
              </div>
              {c.note && <p className="text-sm text-charcoal-500">{c.note}</p>}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-charcoal-500">{formatDate(c.created_at)}</span>
                  <form action={toggleCouponAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="active" value={c.active} />
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${c.active ? "bg-forest-100 text-forest-800 hover:bg-forest-200" : "bg-ivory-200 text-charcoal-500 hover:bg-ivory-100"}`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </form>
                </div>
                <CouponRowActions coupon={c} />
              </div>
            </div>
          ))}
        </div>

        {/* Table on larger screens */}
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Note</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                  <td className="px-5 py-3 font-medium text-forest-900">{c.code}</td>
                  <td className="px-5 py-3">{c.pct}%</td>
                  <td className="px-5 py-3 text-charcoal-500">{c.note}</td>
                  <td className="px-5 py-3">{formatDate(c.created_at)}</td>
                  <td className="px-5 py-3">
                    <form action={toggleCouponAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="active" value={c.active} />
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${c.active ? "bg-forest-100 text-forest-800 hover:bg-forest-200" : "bg-ivory-200 text-charcoal-500 hover:bg-ivory-100"}`}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <CouponRowActions coupon={c} />
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
