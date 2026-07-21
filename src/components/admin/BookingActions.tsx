"use client";

import { useActionState } from "react";
import {
  applyCouponAction,
  assignDriverAction,
  removeCouponAction,
  setExtraChargeAction,
  setFinalAmountAction,
  setPaymentStatusAction,
  setRemarksAction,
  updateBookingStatusAction,
  type AdminActionState,
} from "@/lib/actions/adminBookings";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@/lib/db/types";
import type { Booking, Driver, FleetVehicle } from "@/lib/db/types";
import { GlassSelect } from "@/components/ui/GlassSelect";

const initial: AdminActionState = { ok: false };

export function BookingActions({ booking, drivers, fleet }: { booking: Booking; drivers: Driver[]; fleet: FleetVehicle[] }) {
  const [statusState, statusAction, statusPending] = useActionState(updateBookingStatusAction, initial);
  const [driverState, driverAction, driverPending] = useActionState(assignDriverAction, initial);
  const [paymentState, paymentAction, paymentPending] = useActionState(setPaymentStatusAction, initial);
  const [remarksState, remarksAction, remarksPending] = useActionState(setRemarksAction, initial);
  const [finalAmountState, finalAmountAction, finalAmountPending] = useActionState(setFinalAmountAction, initial);
  const [extraChargeState, extraChargeAction, extraChargePending] = useActionState(setExtraChargeAction, initial);
  const [couponState, couponAction, couponPending] = useActionState(applyCouponAction, initial);
  const [removeCouponState, removeCouponFormAction, removeCouponPending] = useActionState(removeCouponAction, initial);

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
          <GlassSelect
            name="fleetId"
            defaultValue={String(booking.fleet_id ?? "")}
            className="max-w-[220px]"
            placeholder="Vehicle category"
            options={[
              { value: "", label: "No change" },
              ...fleet.map((f) => ({ value: String(f.id), label: `${f.name} (${f.category})` })),
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
        <p className="mt-2 text-xs text-charcoal-500">
          Upgrading the vehicle category doesn&rsquo;t change the price automatically — add the difference below as an extra charge if needed.
        </p>
        {driverState.ok && (
          <p className="mt-2 animate-pop-in text-xs font-medium text-forest-700">✓ Assignment saved.</p>
        )}
      </form>

      <div className="rounded-2xl border border-forest-100 bg-white p-6 transition-shadow duration-200 hover:shadow-sm">
        <h2 className="font-display text-base text-forest-950">Pricing overrides</h2>
        <p className="mt-1 text-xs text-charcoal-500">
          Estimate: {booking.estimate_amount} · Extra charges: {booking.extra_charges} · Discount: {booking.discount_amount}
          {booking.final_amount != null && <> · <strong>Final amount: {booking.final_amount}</strong></>}
        </p>

        <form action={finalAmountAction} className="mt-4 flex flex-wrap items-end gap-3 border-t border-forest-50 pt-4">
          <input type="hidden" name="id" value={booking.id} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Final amount override (₹)</label>
            <input
              name="finalAmount"
              type="number"
              min={0}
              defaultValue={booking.final_amount ?? ""}
              placeholder="Leave empty to use the estimate"
              className="input-field w-56"
            />
          </div>
          <button
            type="submit"
            disabled={finalAmountPending}
            className="rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
          >
            {finalAmountPending ? "Saving..." : "Set final amount"}
          </button>
          {finalAmountState.ok && <p className="w-full text-xs font-medium text-forest-700">✓ Saved.</p>}
          {finalAmountState.error && <p className="w-full text-xs text-red-600">{finalAmountState.error}</p>}
        </form>

        <form action={extraChargeAction} className="mt-4 flex flex-wrap items-end gap-3 border-t border-forest-50 pt-4">
          <input type="hidden" name="id" value={booking.id} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Extra charge (₹)</label>
            <input name="amount" type="number" min={0} defaultValue={booking.extra_charges} className="input-field w-32" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Reason</label>
            <input name="note" defaultValue={booking.extra_charges_note ?? ""} placeholder="e.g. vehicle upgrade" className="input-field" />
          </div>
          <button
            type="submit"
            disabled={extraChargePending}
            className="rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
          >
            {extraChargePending ? "Saving..." : "Save charge"}
          </button>
          {extraChargeState.error && <p className="w-full text-xs text-red-600">{extraChargeState.error}</p>}
        </form>

        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-forest-50 pt-4">
          <form action={couponAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={booking.id} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-900">Apply coupon</label>
              <input name="code" defaultValue={booking.coupon_code ?? ""} placeholder="CODE" className="input-field w-32 uppercase" />
            </div>
            <button
              type="submit"
              disabled={couponPending}
              className="rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
            >
              {couponPending ? "Applying..." : "Apply"}
            </button>
          </form>
          {booking.coupon_code && (
            <form action={removeCouponFormAction}>
              <input type="hidden" name="id" value={booking.id} />
              <button
                type="submit"
                disabled={removeCouponPending}
                className="rounded-xl border border-forest-200 px-5 py-3 text-sm font-semibold text-forest-900 transition-colors duration-200 hover:bg-forest-50 disabled:opacity-60"
              >
                Remove coupon
              </button>
            </form>
          )}
        </div>
        {couponState.error && <p className="mt-2 text-xs text-red-600">{couponState.error}</p>}
        {removeCouponState.ok && <p className="mt-2 text-xs font-medium text-forest-700">✓ Coupon removed.</p>}
      </div>

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
