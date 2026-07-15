import { listTripRequests } from "@/lib/db/queries/tripRequests";
import { cycleTripRequestStatusAction, deleteTripRequestAction } from "@/lib/actions/adminModeration";
import { formatDateTime, formatINR } from "@/lib/format";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { TRIP_REQUEST_STATUSES } from "@/lib/db/types";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  New: "bg-gold-50 text-gold-800",
  Contacted: "bg-forest-100 text-forest-800",
  Converted: "bg-forest-900 text-ivory-50",
  Closed: "bg-charcoal-900/10 text-charcoal-700",
};

export default async function AdminTripRequestsPage() {
  await requireRole(["admin", "manager", "staff"]);
  const requests = listTripRequests();

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Trip Requests</h1>
        <p className="mt-1 text-sm text-charcoal-500">
          Customized trip plans submitted from the &ldquo;Build Your Own Trip&rdquo; flow.
        </p>

        <div className="mt-4 space-y-4 sm:mt-6">
          {requests.map((r) => {
            const nextIndex = (TRIP_REQUEST_STATUSES.indexOf(r.status) + 1) % TRIP_REQUEST_STATUSES.length;
            const nextStatus = TRIP_REQUEST_STATUSES[nextIndex];
            return (
              <div key={r.id} className="rounded-2xl border border-forest-100 bg-white p-4 transition-shadow duration-200 hover:shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-forest-900">
                      {r.name} · <span className="text-charcoal-500">{r.trip_type}</span>
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {r.phone} {r.email && `· ${r.email}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[r.status] ?? "bg-forest-100 text-forest-800"}`}>
                      {r.status}
                    </span>
                    <DeleteButton action={deleteTripRequestAction} id={r.id} confirmLabel={`Delete trip request from ${r.name}?`} />
                  </div>
                </div>

                {r.destinations.length > 0 && (
                  <p className="mt-3 text-sm text-charcoal-700">
                    <span className="font-medium text-forest-900">Places: </span>
                    {r.destinations.join(", ")}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-500">
                  <span>Group size: {r.group_size}</span>
                  {r.duration_label && <span>Duration: {r.duration_label}</span>}
                  {r.travel_month && <span>Travel month: {r.travel_month}</span>}
                  {r.budget_range && <span>Budget: {r.budget_range}</span>}
                  {r.package_slug && <span>Package: {r.package_slug}</span>}
                  {r.hotel_category && <span>Hotel: {r.hotel_category}</span>}
                  {r.vehicle_type && <span>Vehicle: {r.vehicle_type}</span>}
                  {r.computed_total != null && (
                    <span className="font-semibold text-forest-800">Est. total: {formatINR(r.computed_total)}</span>
                  )}
                </div>
                {r.notes && <p className="mt-2 text-sm text-charcoal-700">{r.notes}</p>}
                <p className="mt-2 text-xs text-charcoal-400">{formatDateTime(r.created_at)}</p>

                <form action={cycleTripRequestStatusAction} className="mt-4">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="nextStatus" value={nextStatus} />
                  <button
                    type="submit"
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-forest-700 transition-colors duration-200 hover:bg-forest-50 hover:text-forest-900"
                  >
                    Mark as {nextStatus}
                  </button>
                </form>
              </div>
            );
          })}
          {requests.length === 0 && <p className="text-sm text-charcoal-500">No trip requests yet.</p>}
        </div>
      </Reveal>
    </div>
  );
}
