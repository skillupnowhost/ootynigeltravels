"use client";

import { useActionState } from "react";
import {
  assignDriverAction,
  setPaymentStatusAction,
  setRemarksAction,
  updateBookingStatusAction,
  type AdminActionState,
} from "@/lib/actions/adminBookings";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@/lib/db/types";
import type { Booking, Driver } from "@/lib/db/types";
import { GlassSelect } from "@/components/ui/GlassSelect";

const initial: AdminActionState = { ok: false };

export function BookingActions({ booking, drivers }: { booking: Booking; drivers: Driver[] }) {
  const [statusState, statusAction, statusPending] = useActionState(updateBookingStatusAction, initial);
  const [driverState, driverAction, driverPending] = useActionState(assignDriverAction, initial);
  const [paymentState, paymentAction, paymentPending] = useActionState(setPaymentStatusAction, initial);
  const [remarksState, remarksAction, remarksPending] = useActionState(setRemarksAction, initial);

  return (
    <div className="space-y-6">
      <form action={statusAction} className="rounded-2xl border border-forest-100 bg-white p-6 transition-shadow duration-200 hover:shadow-sm">
        <input type="hidden" name="id" value={booking.id} />
        <h2 className="font-display text-base text-forest-950">Update status</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <GlassSelect
            name="status"
            defaultValue={booking.status}
            className="max-w-[200px]"
            options={BOOKING_STATUSES.map((s) => ({ value: s, label: s }))}
          />
          <input name="note" placeholder="Note (optional)" className="input-field flex-1" />
          <button
            type="submit"
            disabled={statusPending}
            className="rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
          >
            {statusPending ? "Saving..." : "Update"}
          </button>
        </div>
        {statusState.ok && (
          <p className="mt-2 animate-pop-in text-xs font-medium text-forest-700">✓ Status updated.</p>
        )}
      </form>

      <form action={driverAction} className="rounded-2xl border border-forest-100 bg-white p-6 transition-shadow duration-200 hover:shadow-sm">
        <input type="hidden" name="id" value={booking.id} />
        <h2 className="font-display text-base text-forest-950">Assign driver & vehicle</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <GlassSelect
            name="driverId"
            defaultValue={String(booking.driver_id ?? "")}
            className="max-w-[200px]"
            options={[
              { value: "", label: "Unassigned" },
              ...drivers.map((d) => ({ value: String(d.id), label: d.name })),
            ]}
          />
          <input
            name="vehicleNumber"
            defaultValue={booking.vehicle_number ?? ""}
            placeholder="Vehicle number"
            className="input-field max-w-[200px]"
          />
          <button
            type="submit"
            disabled={driverPending}
            className="rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
          >
            {driverPending ? "Saving..." : "Assign"}
          </button>
        </div>
        {driverState.ok && (
          <p className="mt-2 animate-pop-in text-xs font-medium text-forest-700">✓ Assignment saved.</p>
        )}
      </form>

      <form action={paymentAction} className="rounded-2xl border border-forest-100 bg-white p-6 transition-shadow duration-200 hover:shadow-sm">
        <input type="hidden" name="id" value={booking.id} />
        <h2 className="font-display text-base text-forest-950">Payment status</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <GlassSelect
            name="paymentStatus"
            defaultValue={booking.payment_status}
            className="max-w-[200px]"
            options={PAYMENT_STATUSES.map((s) => ({ value: s, label: s }))}
          />
          <button
            type="submit"
            disabled={paymentPending}
            className="rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
          >
            {paymentPending ? "Saving..." : "Update"}
          </button>
        </div>
        {paymentState.ok && (
          <p className="mt-2 animate-pop-in text-xs font-medium text-forest-700">✓ Payment status updated.</p>
        )}
      </form>

      <form action={remarksAction} className="rounded-2xl border border-forest-100 bg-white p-6 transition-shadow duration-200 hover:shadow-sm">
        <input type="hidden" name="id" value={booking.id} />
        <h2 className="font-display text-base text-forest-950">Internal remarks</h2>
        <textarea
          name="remarks"
          defaultValue={booking.remarks ?? ""}
          rows={3}
          className="input-field mt-3"
          placeholder="Notes visible to staff only"
        />
        <button
          type="submit"
          disabled={remarksPending}
          className="mt-3 rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
        >
          {remarksPending ? "Saving..." : "Save remarks"}
        </button>
        {remarksState.ok && (
          <p className="mt-2 animate-pop-in text-xs font-medium text-forest-700">✓ Remarks saved.</p>
        )}
      </form>
    </div>
  );
}
