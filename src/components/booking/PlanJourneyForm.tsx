"use client";

import { Suspense, useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Copy, Mail, Minus, Plus, User as UserIcon, Phone, Search } from "lucide-react";
import { createBookingAction, type BookingFormState } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GlassDateRangePicker } from "@/components/ui/GlassDatePicker";
import {
  CompassIcon,
  SparkleBurstIcon,
  CalendarCheckIcon,
  MapPinDropIcon,
  ShieldBadgeIcon,
} from "@/components/ui/AnimatedIcons";
import { formatINR } from "@/lib/format";
import { site, waLink, mailtoLink } from "@/lib/config/site";
import type { Destination, TourPackage } from "@/lib/db/types";

const initialState: BookingFormState = { ok: false };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function tripLength(startDate: string, endDate: string): { days: number; nights: number } | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (Number.isNaN(diff) || diff < 0) return null;
  const days = diff + 1;
  return { days, nights: Math.max(0, days - 1) };
}

interface PlanJourneyFormProps {
  packages: TourPackage[];
  destinations: Destination[];
  compact?: boolean;
}

export function PlanJourneyForm(props: PlanJourneyFormProps) {
  return (
    <Suspense fallback={null}>
      <PlanJourneyFormInner {...props} />
    </Suspense>
  );
}

function PlanJourneyFormInner({ packages, destinations, compact = false }: PlanJourneyFormProps) {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(createBookingAction, initialState);

  const defaultDestination = destinations[0]?.name ?? "Ooty / Nilgiris";
  const [destination, setDestination] = useState(searchParams.get("destination") ?? defaultDestination);
  const [packageSlug, setPackageSlug] = useState(searchParams.get("package") ?? packages[0]?.slug ?? "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") ?? "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? "");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const length = useMemo(() => tripLength(startDate, endDate), [startDate, endDate]);
  const selectedPackage = packages.find((p) => p.slug === packageSlug);

  const estimate = useMemo(() => {
    if (!selectedPackage) return 0;
    const extraAdults = Math.max(0, adults - 2);
    const amount =
      selectedPackage.price_from + extraAdults * selectedPackage.price_from * 0.15 + children * selectedPackage.price_from * 0.08;
    return Math.round(amount / 10) * 10;
  }, [selectedPackage, adults, children]);

  function handleStartDateChange(value: string) {
    setStartDate(value);
    if (endDate && endDate < value) setEndDate(value);
  }

  if (state.ok && state.bookingCode) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="confirmation"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <BookingConfirmation code={state.bookingCode} estimate={state.estimate ?? 0} compact={compact} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (compact) {
    return (
      <motion.form
        action={formAction}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card relative w-full max-w-md overflow-hidden rounded-[2rem] p-6 shadow-[0_32px_70px_-28px_rgba(11,59,46,0.4)] ring-1 ring-gold-200/50 sm:p-7 lg:ml-auto"
        aria-label="Plan your Ooty journey"
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-gold-500 to-transparent"
          aria-hidden
        />
        <div className="mb-1 flex items-center justify-between">
          <p className="font-display text-lg text-forest-950">Plan Your Ooty Journey</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest-700">
            <ShieldBadgeIcon size={13} loop={false} /> Pay later
          </span>
        </div>
        <p className="mb-5 text-sm text-charcoal-500">Two minutes to plan — no account needed.</p>

        <input type="hidden" name="destination" value={selectedPackage?.name ?? destination} />

        <div className="space-y-3">
          <CompactField label="Customize Package">
            <GlassSelect
              name="packageSlug"
              size="sm"
              variant="subtle"
              value={packageSlug}
              onChange={setPackageSlug}
              options={packages.map((p) => ({ value: p.slug, label: p.name }))}
            />
            <Link
              href="/packages/customize"
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-gold-700 hover:text-gold-800 hover:underline"
            >
              Want something unique? Build your own trip →
            </Link>
          </CompactField>

          <CompactField label="Trip dates">
            <GlassDateRangePicker
              startName="startDate"
              endName="endDate"
              startValue={startDate}
              endValue={endDate}
              onStartChange={handleStartDateChange}
              onEndChange={setEndDate}
              min={todayISO()}
              variant="subtle"
              required
            />
          </CompactField>

          {length && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-800">
              <CalendarCheckIcon size={13} loop={false} /> {length.days} Days / {length.nights} Nights
            </p>
          )}

          <CompactField label="Pickup location">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">
                <MapPinDropIcon size={16} loop={false} />
              </span>
              <input
                type="text"
                name="pickupLocation"
                required
                placeholder="Coimbatore Airport, hotel..."
                className="input-field pl-10 text-sm"
              />
            </div>
          </CompactField>

          <div className="grid grid-cols-2 gap-3">
            <StepperField label="Adults" value={adults} onChange={setAdults} min={1} max={30} name="adults" />
            <StepperField label="Children" value={children} onChange={setChildren} min={0} max={20} name="children" />
          </div>

          <CompactField label="Full name">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">
                <UserIcon size={16} />
              </span>
              <input type="text" name="name" required placeholder="Your name" className="input-field pl-10 text-sm" />
            </div>
          </CompactField>

          <CompactField label="Mobile number">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">
                <MotionIcon preset="ring">
                  <Phone size={16} />
                </MotionIcon>
              </span>
              <input
                type="tel"
                inputMode="tel"
                name="phone"
                required
                placeholder="10-digit mobile number"
                className="input-field pl-10 text-sm"
              />
            </div>
          </CompactField>

          <CompactField label="Email (optional)">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">
                <Mail size={16} />
              </span>
              <input type="email" name="email" placeholder="you@example.com" className="input-field pl-10 text-sm" />
            </div>
          </CompactField>
        </div>

        {state.error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-600 px-6 py-3.5 text-sm font-semibold text-forest-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-700 hover:shadow-[0_12px_30px_-8px_rgba(200,161,92,0.6)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? "Planning..." : "Plan My Journey"}
          <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>

        <p className="mt-3 text-center text-[11px] text-charcoal-500">
          No payment required now — confirmed by our team within minutes.
        </p>

        <Link
          href="/track"
          className="mt-4 flex items-center justify-center gap-1.5 border-t border-forest-100 pt-4 text-xs font-semibold text-forest-700 hover:text-gold-700 hover:underline"
        >
          <Search size={13} />
          Already booked? Track my trip
        </Link>
      </motion.form>
    );
  }

  return (
    <motion.form
      action={formAction}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-10">
        <section>
          <StepLabel n={1} title="Where would you like to go?" icon={<CompassIcon size={20} loop={false} />} />
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldWrap label="Destination">
              <GlassSelect
                name="destination"
                value={destination}
                onChange={setDestination}
                options={destinations.map((d) => ({ value: d.name, label: d.name }))}
              />
            </FieldWrap>
            <FieldWrap label="Travel package">
              <GlassSelect
                name="packageSlug"
                value={packageSlug}
                onChange={setPackageSlug}
                options={packages.map((p) => ({ value: p.slug, label: `${p.name} — ${p.duration_label}` }))}
              />
            </FieldWrap>
          </div>
        </section>

        <section>
          <StepLabel n={2} title="Trip dates & pickup" icon={<CalendarCheckIcon size={20} loop={false} />} />
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldWrap label="Trip dates" className="sm:col-span-2">
              <GlassDateRangePicker
                startName="startDate"
                endName="endDate"
                startValue={startDate}
                endValue={endDate}
                onStartChange={handleStartDateChange}
                onEndChange={setEndDate}
                min={todayISO()}
                required
              />
            </FieldWrap>
            {length && (
              <p className="sm:col-span-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1.5 text-xs font-semibold text-gold-800">
                <CalendarCheckIcon size={14} loop={false} /> {length.days} Days / {length.nights} Nights — auto-calculated
              </p>
            )}
            <FieldWrap label="Pickup location" className="sm:col-span-2" icon={<MapPinDropIcon size={16} loop={false} />}>
              <input
                type="text"
                name="pickupLocation"
                required
                placeholder="e.g. Coimbatore Airport, or your hotel in Ooty"
                className="input-field pl-10"
              />
            </FieldWrap>
            <FieldWrap label="Adults">
              <input
                type="number"
                name="adults"
                min={1}
                max={30}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="input-field"
              />
            </FieldWrap>
            <FieldWrap label="Children">
              <input
                type="number"
                name="children"
                min={0}
                max={20}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="input-field"
              />
            </FieldWrap>
          </div>
        </section>

        <section>
          <StepLabel n={3} title="Your details" />
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldWrap label="Full name" icon={<UserIcon size={16} />}>
              <input type="text" name="name" required className="input-field pl-10" />
            </FieldWrap>
            <FieldWrap label="Mobile number" icon={<Phone size={16} />}>
              <input
                type="tel"
                name="phone"
                required
                placeholder="10-digit mobile number"
                className="input-field pl-10"
              />
            </FieldWrap>
            <FieldWrap label="Email (optional)" icon={<Mail size={16} />}>
              <input type="email" name="email" className="input-field pl-10" />
            </FieldWrap>
          </div>
        </section>

        {state.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
        )}

        <Button type="submit" variant="gold" disabled={pending} className="w-full justify-center sm:w-auto">
          {pending ? "Planning..." : "Plan My Journey"}
        </Button>
      </div>

      <aside className="h-fit rounded-3xl border border-forest-100 bg-white p-7">
        <h2 className="font-display text-lg text-forest-950">Estimate</h2>
        {selectedPackage && <p className="mt-1 text-sm text-charcoal-500">{selectedPackage.name}</p>}
        <p className="mt-4 font-display text-3xl text-forest-950">{formatINR(estimate)}</p>
        <p className="mt-1 text-xs text-charcoal-500">
          Estimate only — final pricing is confirmed by our team.
        </p>
        <div className="mt-6 space-y-2 border-t border-forest-100 pt-4 text-sm text-charcoal-700">
          <div className="flex justify-between">
            <span>Destination</span>
            <span>{destination}</span>
          </div>
          {length && (
            <div className="flex justify-between">
              <span>Duration</span>
              <span>
                {length.days}D / {length.nights}N
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Adults</span>
            <span>{adults}</span>
          </div>
          <div className="flex justify-between">
            <span>Children</span>
            <span>{children}</span>
          </div>
        </div>
        <p className="mt-6 flex items-center gap-2 border-t border-forest-100 pt-4 text-xs text-charcoal-500">
          <ShieldBadgeIcon size={16} className="text-forest-600" />
          No payment now — pay securely once our team confirms your booking.
        </p>
      </aside>
    </motion.form>
  );
}

function BookingConfirmation({
  code,
  estimate,
  compact,
}: {
  code: string;
  estimate: number;
  compact: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className={`mx-auto text-center ${
        compact
          ? "glass-card w-full max-w-md rounded-[2rem] p-7 shadow-[0_32px_70px_-28px_rgba(11,59,46,0.4)]"
          : "max-w-xl rounded-3xl border border-forest-100 bg-white p-10"
      }`}
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 text-forest-700"
      >
        <SparkleBurstIcon size={32} loop={false} />
      </motion.div>
      <h2 className="mt-4 font-display text-2xl text-forest-950">Journey received</h2>
      <p className="mt-2 text-sm text-charcoal-500">
        Our team will confirm availability shortly. Save your booking ID to track its status.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-forest-50 px-6 py-4">
        <span className="font-display text-xl tracking-wide text-forest-950">{code}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-forest-700 hover:text-gold-700"
          aria-label="Copy booking ID"
        >
          <MotionIcon preset="pop">
            <Copy size={16} />
          </MotionIcon>
        </button>
      </div>
      {copied && <p className="mt-1 text-xs text-forest-700">Copied</p>}
      <p className="mt-4 font-display text-lg text-forest-950">{formatINR(estimate)}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={waLink(`Hello ${site.name}, I've just planned journey ${code}. Please confirm the details.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Confirm on WhatsApp
        </a>
        <a
          href={mailtoLink(
            `Journey ${code} — confirmation request`,
            `Hello ${site.name},\n\nI've just planned journey ${code} for an estimated ${formatINR(estimate)}. Please confirm the details.\n\nThank you.`
          )}
          className="inline-flex items-center gap-2 rounded-full border border-forest-200 px-5 py-2.5 text-sm font-semibold text-forest-900"
        >
          <MotionIcon preset="tilt">
            <Mail size={16} />
          </MotionIcon>
          Email us
        </a>
        <a
          href={`/track?code=${code}`}
          className="inline-flex items-center gap-1 rounded-full border border-forest-200 px-5 py-2.5 text-sm font-semibold text-forest-900"
        >
          Track journey
          <MotionIcon preset="bounce">
            <ChevronRight size={16} />
          </MotionIcon>
        </a>
      </div>
    </div>
  );
}

function StepLabel({ n, title, icon }: { n: number; title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-900 text-xs font-semibold text-ivory-50">
        {n}
      </span>
      <h2 className="font-display text-lg text-forest-950">{title}</h2>
      {icon && (
        <span className="text-forest-600" aria-hidden>
          {icon}
        </span>
      )}
    </div>
  );
}

function FieldWrap({
  label,
  children,
  className = "",
  icon,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-forest-900">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">
            <MotionIcon preset="tilt">{icon}</MotionIcon>
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

function CompactField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-forest-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function StepperField({
  label,
  value,
  onChange,
  min,
  max,
  name,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  name: string;
}) {
  return (
    <CompactField label={label}>
      <div className="flex items-center justify-between rounded-xl border border-forest-200 bg-white px-2 py-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-forest-50"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus size={14} />
        </button>
        <span className="text-sm font-semibold text-forest-950">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-forest-50"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus size={14} />
        </button>
      </div>
      <input type="hidden" name={name} value={value} />
    </CompactField>
  );
}
