import { TrendingUp } from "lucide-react";
import { bookingStats, popularFleet, popularPackages, revenueByMonth } from "@/lib/db/queries/bookings";
import { averageRating } from "@/lib/db/queries/reviews";
import { formatINR } from "@/lib/format";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";
import { MotionIcon } from "@/components/ui/MotionIcon";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireRole(["admin", "manager"]);
  const stats = await bookingStats();
  const packages = await popularPackages();
  const fleet = await popularFleet();
  const revenue = await revenueByMonth();
  const { average, count } = await averageRating();

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Reports</h1>
      </Reveal>

      <RevealGroup className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
        <RevealItem>
          <Panel title="Bookings by status">
            <ul className="space-y-2">
              {Object.entries(stats.byStatus).map(([status, n]) => (
                <Bar key={status} label={status} value={n} max={stats.total} />
              ))}
            </ul>
          </Panel>
        </RevealItem>

        <RevealItem>
          <Panel
            title="Revenue by month (paid bookings)"
            icon={
              <MotionIcon preset="pulse" loop className="text-gold-700">
                <TrendingUp size={16} />
              </MotionIcon>
            }
          >
            {revenue.length === 0 ? (
              <p className="text-sm text-charcoal-500">No paid bookings recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {revenue.map((r) => (
                  <li key={r.month} className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-700">{r.month}</span>
                    <span className="font-semibold text-forest-900">{formatINR(r.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </RevealItem>

        <RevealItem>
          <Panel title="Most-booked packages">
            {packages.length === 0 ? (
              <p className="text-sm text-charcoal-500">No package bookings yet.</p>
            ) : (
              <ul className="space-y-2">
                {packages.map((p) => (
                  <Bar key={p.name} label={p.name} value={p.count} max={packages[0].count} />
                ))}
              </ul>
            )}
          </Panel>
        </RevealItem>

        <RevealItem>
          <Panel title="Most-booked vehicles">
            {fleet.length === 0 ? (
              <p className="text-sm text-charcoal-500">No vehicle-only bookings yet.</p>
            ) : (
              <ul className="space-y-2">
                {fleet.map((f) => (
                  <Bar key={f.name} label={f.name} value={f.count} max={fleet[0].count} />
                ))}
              </ul>
            )}
          </Panel>
        </RevealItem>

        <RevealItem>
          <Panel title="Reviews" icon={<GlowStarIcon size={16} className="text-gold-500" loop={false} />}>
            <p className="font-display text-3xl text-forest-950">
              {average.toFixed(1)} <span className="text-base font-sans text-charcoal-500">/ 5</span>
            </p>
            <p className="mt-1 text-sm text-charcoal-500">from {count} published reviews</p>
          </Panel>
        </RevealItem>
      </RevealGroup>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="h-full rounded-2xl border border-forest-100 bg-white p-4 transition-shadow duration-200 hover:shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-charcoal-500">
        {icon}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <li>
      <div className="flex items-center justify-between text-sm">
        <span className="text-charcoal-700">{label}</span>
        <span className="font-semibold text-forest-900">{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-forest-100">
        <div className="h-full rounded-full bg-forest-700 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
