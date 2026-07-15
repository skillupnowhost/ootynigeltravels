import { requireRole } from "@/lib/auth/rbac";
import { listAuditLogs } from "@/lib/db/queries/auditLogs";
import { formatDateTime } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  await requireRole(["admin"]);
  const logs = await listAuditLogs();

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <ShieldBadgeIcon size={26} className="text-gold-700" loop={false} />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Audit Log</h1>
        </div>
        <p className="mt-1 text-sm text-charcoal-500">Every admin mutation, most recent first.</p>

        {/* Card list on small screens */}
        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col gap-1 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-forest-900">{log.action}</span>
                <span className="shrink-0 text-xs text-charcoal-500">{formatDateTime(log.created_at)}</span>
              </div>
              <p className="text-sm text-charcoal-500">
                {log.actor_name ?? "System"} · {log.entity_type}
                {log.entity_id && <span className="text-charcoal-400"> #{log.entity_id}</span>}
              </p>
              {log.meta && <p className="truncate text-xs text-charcoal-400">{log.meta}</p>}
            </div>
          ))}
          {logs.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-charcoal-500">No activity recorded yet.</p>
          )}
        </div>

        {/* Table on larger screens */}
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Entity</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                  <td className="px-5 py-3 whitespace-nowrap text-charcoal-500">{formatDateTime(log.created_at)}</td>
                  <td className="px-5 py-3">{log.actor_name ?? "System"}</td>
                  <td className="px-5 py-3 font-medium text-forest-900">{log.action}</td>
                  <td className="px-5 py-3">
                    {log.entity_type}
                    {log.entity_id && <span className="text-charcoal-400"> #{log.entity_id}</span>}
                  </td>
                  <td className="px-5 py-3 max-w-xs truncate text-xs text-charcoal-400">{log.meta}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-charcoal-500">
                    No activity recorded yet.
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
