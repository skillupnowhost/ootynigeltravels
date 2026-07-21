"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Mail, User as UserIcon, ChevronRight, Copy } from "lucide-react";
import { submitTripRequest, type TripRequestFormState } from "@/lib/actions/public";
import { Button } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { EmailField } from "@/components/ui/EmailField";
import {
  FamilyGroupIcon,
  HeartBeatIcon,
  MountainSunIcon,
  FriendsGroupIcon,
  SparkleBurstIcon,
  CalendarCheckIcon,
  MapPinDropIcon,
} from "@/components/ui/AnimatedIcons";
import { site, waLink, mailtoLink } from "@/lib/config/site";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GlassDateRangePicker } from "@/components/ui/GlassDatePicker";
import type { Destination } from "@/lib/db/types";

const initialState: TripRequestFormState = { ok: false };
const ease = [0.22, 1, 0.36, 1] as const;

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

const TRIP_TYPES = [
  { key: "Family", label: "Family", icon: FamilyGroupIcon },
  { key: "Honeymoon", label: "Honeymoon", icon: HeartBeatIcon },
  { key: "Adventure", label: "Adventure", icon: MountainSunIcon },
  { key: "Friends", label: "Friends", icon: FriendsGroupIcon },
  { key: "Other", label: "Something else", icon: SparkleBurstIcon },
] as const;

const BROCHURE_STOPS = [
  "Doddabetta Peak",
  "Tea & Chocolate Factory",
  "Botanical Garden",
  "Rose Garden",
  "Boat House",
  "Ooty Lake",
  "Sim's Park",
  "Lamb's Rock",
  "Dolphin's Nose",
  "Catherine Falls",
  "Pykara Lake & Boat House",
  "Pykara Falls",
  "Avalanche Valley",
  "Mudumalai Wildlife Sanctuary",
  "Kotagiri viewpoints",
];

const BUDGET_RANGES = ["Under ₹15,000", "₹15,000 – ₹30,000", "₹30,000 – ₹50,000", "₹50,000+", "Not sure yet"];

export function CustomTripForm({ destinations }: { destinations: Destination[] }) {
  const [state, formAction, pending] = useActionState(submitTripRequest, initialState);
  const [tripType, setTripType] = useState<string>("Family");
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [emailOk, setEmailOk] = useState(true);

  const length = useMemo(() => tripLength(startDate, endDate), [startDate, endDate]);
  const durationLabel = length ? `${length.days} Days / ${length.nights} Nights` : "";

  function handleStartDateChange(value: string) {
    setStartDate(value);
    if (endDate && endDate < value) setEndDate(value);
  }

  const allStops = useMemo(
    () => [...destinations.map((d) => d.name), ...BROCHURE_STOPS.filter((s) => !destinations.some((d) => d.name === s))],
    [destinations]
  );

  function toggleStop(name: string) {
    setSelectedStops((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));
  }

  if (state.ok && state.request) {
    return <TripRequestConfirmation tripType={state.request.trip_type} destinations={state.request.destinations} />;
  }

  return (
    <motion.form
      action={formAction}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="space-y-10"
    >
      <input type="hidden" name="trip_type" value={tripType} />
      {selectedStops.map((s) => (
        <input key={s} type="hidden" name="destinations" value={s} />
      ))}

      <section>
        <StepLabel n={1} title="What kind of trip is this?" />
        <div className="mt-4 flex flex-wrap gap-2.5">
          {TRIP_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTripType(t.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                tripType === t.key
                  ? "border-forest-900 bg-forest-900 text-ivory-50"
                  : "border-forest-200 bg-white text-forest-900 hover:border-forest-400"
              }`}
            >
              <span className={tripType === t.key ? "text-gold-400" : "text-forest-600"}>
                <t.icon size={16} loop={tripType === t.key} />
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <StepLabel n={2} title="Which places would you like to include?" icon={<MapPinDropIcon size={20} loop={false} />} />
        <p className="mt-2 text-sm text-charcoal-500">Pick as many as you like — this is just a starting point for our team.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {allStops.map((name) => {
            const active = selectedStops.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleStop(name)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                  active ? "border-gold-600 bg-gold-50 text-gold-800" : "border-forest-100 bg-white text-charcoal-700 hover:border-forest-300"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <StepLabel n={3} title="Trip details" icon={<CalendarCheckIcon size={20} loop={false} />} />
        <input type="hidden" name="duration_label" value={durationLabel} />
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FieldWrap label="Preferred travel dates (optional)" className="sm:col-span-2">
            <GlassDateRangePicker
              startName="start_date"
              endName="end_date"
              startValue={startDate}
              endValue={endDate}
              onStartChange={handleStartDateChange}
              onEndChange={setEndDate}
              min={todayISO()}
            />
          </FieldWrap>
          {length && (
            <p className="sm:col-span-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1.5 text-xs font-semibold text-gold-800">
              <CalendarCheckIcon size={14} loop={false} /> {length.days} Days / {length.nights} Nights — auto-calculated
            </p>
          )}
          <FieldWrap label="Not sure of exact dates? Preferred month">
            <input type="text" name="travel_month" placeholder="e.g. December 2026" className="input-field" />
          </FieldWrap>
          <FieldWrap label="Group size">
            <input type="number" name="group_size" min={1} max={60} defaultValue={2} className="input-field" />
          </FieldWrap>
          <FieldWrap label="Budget range">
            <GlassSelect
              name="budget_range"
              placeholder="Select a range"
              options={BUDGET_RANGES.map((b) => ({ value: b, label: b }))}
            />
          </FieldWrap>
        </div>
        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Anything else we should know?</label>
          <textarea
            name="notes"
            rows={4}
            placeholder="Special occasions, accessibility needs, pace of travel, must-see spots..."
            className="w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none transition-colors focus:border-gold-500"
          />
        </div>
      </section>

      <section>
        <StepLabel n={4} title="Your details" />
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FieldWrap label="Full name" icon={<UserIcon size={16} />}>
            <input type="text" name="name" required className="input-field pl-10" />
          </FieldWrap>
          <FieldWrap label="Phone number">
            <PhoneInput name="phone" required onValueChange={(info) => setPhoneValid(info.valid)} />
          </FieldWrap>
          <FieldWrap label="Email (optional)" icon={<Mail size={16} />} className="sm:col-span-2">
            <EmailField name="email" onValueChange={(info) => setEmailOk(info.valid || info.value === "")} />
          </FieldWrap>
        </div>
      </section>

      {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}

      <Button
        type="submit"
        variant="gold"
        disabled={pending || !phoneValid || !emailOk}
        className="w-full justify-center sm:w-auto"
      >
        {pending ? "Sending..." : "Send My Trip Plan"}
      </Button>
    </motion.form>
  );
}

function TripRequestConfirmation({ tripType, destinations }: { tripType: string; destinations: string[] }) {
  const [copied, setCopied] = useState(false);
  const summary = `Hello ${site.name}, I'd like to plan a ${tripType} trip${
    destinations.length ? ` including: ${destinations.join(", ")}` : ""
  }. Could you help me put together an itinerary?`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease }}
        className="mx-auto max-w-xl rounded-3xl border border-forest-100 bg-white p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 text-forest-700"
        >
          <CalendarCheckIcon size={32} />
        </motion.div>
        <h2 className="mt-4 font-display text-2xl text-forest-950">Your trip plan is with us</h2>
        <p className="mt-2 text-sm text-charcoal-500">
          Our team will review it and reach out with a tailored itinerary and pricing — usually within a few hours.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={waLink(summary)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Discuss on WhatsApp
          </a>
          <a
            href={mailtoLink(`${tripType} trip plan request`, summary)}
            className="inline-flex items-center gap-2 rounded-full border border-forest-200 px-5 py-2.5 text-sm font-semibold text-forest-900"
          >
            <MotionIcon preset="tilt">
              <Mail size={16} />
            </MotionIcon>
            Email us
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(summary);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-forest-200 px-5 py-2.5 text-sm font-semibold text-forest-900"
          >
            <MotionIcon preset="pop">
              <Copy size={16} />
            </MotionIcon>
            Copy summary
          </button>
        </div>
        {copied && <p className="mt-2 text-xs text-forest-700">Copied</p>}
        <Link
          href="/packages"
          className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:underline"
        >
          Browse ready-made packages
          <MotionIcon preset="bounce">
            <ChevronRight size={16} />
          </MotionIcon>
        </Link>
      </motion.div>
    </AnimatePresence>
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
