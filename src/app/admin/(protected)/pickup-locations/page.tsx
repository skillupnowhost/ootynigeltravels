import { listPickupLocations } from "@/lib/db/queries/pickupLocations";
import { PickupLocationCreateForm } from "@/components/admin/PickupLocationCreateForm";
import { PickupLocationRowActions } from "@/components/admin/PickupLocationRowActions";
import { togglePickupLocationAction } from "@/lib/actions/adminContent";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function AdminPickupLocationsPage() {
  await requireRole(["admin", "manager"]);
  const locations = await listPickupLocations();

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Pickup Locations</h1>
        <p className="mt-1 text-sm text-charcoal-500">
          The strict list of pickup points offered on the booking form — customers can only choose from these.
        </p>

        <div className="mt-4 sm:mt-6">
          <PickupLocationCreateForm />
        </div>

        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {locations.map((l) => (
            <div key={l.id} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-forest-900">{l.label}</span>
                <span className="text-xs text-charcoal-500">{l.city}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <form action={togglePickupLocationAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="active" value={l.active} />
                  <button
                    type="submit"
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${l.active ? "bg-forest-100 text-forest-800 hover:bg-forest-200" : "bg-ivory-200 text-charcoal-500 hover:bg-ivory-100"}`}
                  >
                    {l.active ? "Active" : "Inactive"}
                  </button>
                </form>
                <PickupLocationRowActions location={l} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Pickup point</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                  <td className="px-5 py-3 text-charcoal-500">{l.city}</td>
                  <td className="px-5 py-3 font-medium text-forest-900">{l.label}</td>
                  <td className="px-5 py-3">
                    <form action={togglePickupLocationAction}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="active" value={l.active} />
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${l.active ? "bg-forest-100 text-forest-800 hover:bg-forest-200" : "bg-ivory-200 text-charcoal-500 hover:bg-ivory-100"}`}
                      >
                        {l.active ? "Active" : "Inactive"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <PickupLocationRowActions location={l} />
                  </td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-charcoal-500">
                    No pickup locations yet.
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
