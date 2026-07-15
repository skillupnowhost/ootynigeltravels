import { listContactMessages } from "@/lib/db/queries/contactMessages";
import { markMessageHandledAction, deleteMessageAction } from "@/lib/actions/adminModeration";
import { formatDateTime } from "@/lib/format";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireRole(["admin", "manager"]);
  const messages = listContactMessages();

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Messages</h1>

        <div className="mt-4 space-y-4 sm:mt-6">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-forest-100 bg-white p-4 transition-shadow duration-200 hover:shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-forest-900">{m.name}</p>
                  <p className="text-xs text-charcoal-500">
                    {m.email} {m.phone && `· ${m.phone}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    m.handled ? "bg-forest-100 text-forest-800" : "bg-gold-50 text-gold-800"
                  }`}
                >
                  {m.handled ? "Handled" : "New"}
                </span>
                <DeleteButton action={deleteMessageAction} id={m.id} confirmLabel={`Delete message from ${m.name}?`} />
              </div>
              {m.subject && <p className="mt-3 text-sm font-medium text-forest-900">{m.subject}</p>}
              <p className="mt-1 text-sm text-charcoal-700">{m.message}</p>
              <p className="mt-2 text-xs text-charcoal-400">{formatDateTime(m.created_at)}</p>
              <form action={markMessageHandledAction} className="mt-4">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="handled" value={m.handled} />
                <button
                  type="submit"
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-forest-700 transition-colors duration-200 hover:bg-forest-50 hover:text-forest-900"
                >
                  Mark as {m.handled ? "unhandled" : "handled"}
                </button>
              </form>
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-charcoal-500">No messages yet.</p>}
        </div>
      </Reveal>
    </div>
  );
}
