"use client";

import { useActionState } from "react";
import { XCircle } from "lucide-react";
import { requestCancellationAction, type CancelFormState } from "@/lib/actions/booking";

const initial: CancelFormState = { ok: false };

export function CancelBookingButton({ code, phone }: { code: string; phone: string }) {
  const [state, formAction, pending] = useActionState(requestCancellationAction, initial);

  if (state.ok) {
    return <p className="text-xs font-semibold text-gold-700">Cancellation requested</p>;
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Request cancellation for this booking?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="phone" value={phone} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 transition-colors hover:text-red-600 disabled:opacity-50"
      >
        <XCircle size={14} />
        {pending ? "Requesting..." : "Request cancellation"}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
