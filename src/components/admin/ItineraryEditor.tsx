"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { setItineraryAction, type AdminActionState } from "@/lib/actions/adminBookings";
import type { Booking, ItineraryDay } from "@/lib/db/types";

const initial: AdminActionState = { ok: false };

export function ItineraryEditor({ booking }: { booking: Booking }) {
  const [state, formAction, pending] = useActionState(setItineraryAction, initial);
  const [days, setDays] = useState<ItineraryDay[]>(
    booking.itinerary.length > 0 ? booking.itinerary : [{ day: 1, title: "", description: "" }]
  );

  function addDay() {
    setDays((prev) => [...prev, { day: prev.length + 1, title: "", description: "" }]);
  }

  function removeDay(index: number) {
    setDays((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })));
  }

  function updateDay(index: number, field: "title" | "description", value: string) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  }

  return (
    <form action={formAction} className="rounded-2xl border border-forest-100 bg-white p-6">
      <input type="hidden" name="id" value={booking.id} />
      <input type="hidden" name="itinerary" value={JSON.stringify(days)} />

      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-forest-950">Trip plan / itinerary</h2>
        <span className="text-xs text-charcoal-500">
          {days.length} day{days.length === 1 ? "" : "s"} / {Math.max(days.length - 1, 0)} night
          {days.length - 1 === 1 ? "" : "s"}
        </span>
      </div>
      <p className="mt-1 text-xs text-charcoal-500">
        Build a day-by-day plan for this trip — destinations and places to visit each day. Shown to the guest on
        their trip document.
      </p>

      <div className="mt-4 space-y-4">
        {days.map((day, index) => (
          <div key={index} className="rounded-xl border border-forest-100 bg-ivory-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-forest-900">
                <GripVertical size={14} className="text-forest-300" />
                Day {day.day}
              </div>
              <button
                type="button"
                onClick={() => removeDay(index)}
                disabled={days.length === 1}
                className="text-charcoal-400 hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
                aria-label={`Remove day ${day.day}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <input
              value={day.title}
              onChange={(e) => updateDay(index, "title", e.target.value)}
              placeholder="e.g. Ooty Lake, Botanical Garden & Rose Garden"
              className="input-field mt-2"
            />
            <textarea
              value={day.description}
              onChange={(e) => updateDay(index, "description", e.target.value)}
              placeholder="Places to visit and plan for the day, in order"
              rows={2}
              className="input-field mt-2"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addDay}
          className="inline-flex items-center gap-1.5 rounded-xl border border-forest-200 px-4 py-2 text-sm font-medium text-forest-900 transition-colors duration-200 hover:border-forest-400"
        >
          <Plus size={15} />
          Add day
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save trip plan"}
        </button>
        {state.ok && <p className="animate-pop-in text-xs font-medium text-forest-700">✓ Trip plan saved.</p>}
        {state.error && <p className="text-xs font-medium text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
