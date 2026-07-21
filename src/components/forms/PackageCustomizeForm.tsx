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
import { CalendarCheckIcon, MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GlassDatePicker } from "@/components/ui/GlassDatePicker";
import { site, waLink, mailtoLink } from "@/lib/config/site";
import { formatINR } from "@/lib/format";
import { tripCategoryMeta } from "@/lib/config/tripCategories";
import type { TourPackage, FleetVehicle } from "@/lib/db/types";

const initialState: TripRequestFormState = { ok: false };
const ease = [0.22, 1, 0.36, 1] as const;

const HOTEL_CATEGORIES = [
  { key: "Standard", label: "Standard", multiplier: 1 },
  { key: "Deluxe", label: "Deluxe", multiplier: 1.15 },
  { key: "Premium", label: "Premium", multiplier: 1.35 },
  { key: "Luxury", label: "Luxury", multiplier: 1.75 },
];

const MEAL_PLANS = [
  { key: "RoomOnly", label: "Room Only", perPersonPerDay: 0 },
  { key: "Breakfast", label: "Breakfast Only", perPersonPerDay: 250 },
  { key: "HalfBoard", label: "Half Board (Breakfast + Dinner)", perPersonPerDay: 550 },
  { key: "FullBoard", label: "Full Board (All Meals)", perPersonPerDay: 800 },
];

const SIGHTSEEING_ADDONS = [
  { key: "Guided Tea Factory Tour", price: 800 },
  { key: "Lake Boating Session", price: 400 },
  { key: "Extra Wildlife Safari Slot", price: 1500 },
  { key: "Professional Photography (2 hrs)", price: 2500 },
  { key: "Guided Nature Trek", price: 1200 },
];

function computeTotal(opts: {
  base: number;
  days: number;
  adults: number;
  children: number;
  hotelMultiplier: number;
  vehicleDelta: number;
  addons: string[];
}) {
  const extraAdults = Math.max(0, opts.adults - 2);
  const subtotal = opts.base + extraAdults * opts.base * 0.15 + opts.children * opts.base * 0.08;
  const addonsSum = opts.addons.reduce((sum, key) => {
    const addon = SIGHTSEEING_ADDONS.find((a) => a.key === key);
    return sum + (addon?.price ?? 0);
  }, 0);
  const total = subtotal * opts.hotelMultiplier + opts.vehicleDelta + addonsSum;
  return Math.round(total / 10) * 10;
}

export function PackageCustomizeForm({ pkg, fleet }: { pkg: TourPackage; fleet: FleetVehicle[] }) {
  const [state, formAction, pending] = useActionState(submitTripRequest, initialState);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hotelCategory, setHotelCategory] = useState("Standard");
  const [vehicleType, setVehicleType] = useState(pkg.vehicle_options[0] ?? "");
  const [mealPlan, setMealPlan] = useState("Breakfast");
  const [addons, setAddons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [emailOk, setEmailOk] = useState(true);

  const days = pkg.duration_days ?? 1;
  const defaultVehicle = fleet.find((v) => v.category === pkg.vehicle_options[0]);
  const selectedVehicle = fleet.find((v) => v.category === vehicleType);
  const vehicleDelta = useMemo(() => {
    if (!selectedVehicle || !defaultVehicle) return 0;
    return selectedVehicle.price_per_day > defaultVehicle.price_per_day
      ? (selectedVehicle.price_per_day - defaultVehicle.price_per_day) * days
      : 0;
  }, [selectedVehicle, defaultVehicle, days]);
  const mealsCost = useMemo(() => {
    const plan = MEAL_PLANS.find((m) => m.key === mealPlan);
    return (plan?.perPersonPerDay ?? 0) * (adults + children) * days;
  }, [mealPlan, adults, children, days]);
  const hotelMultiplier = HOTEL_CATEGORIES.find((h) => h.key === hotelCategory)?.multiplier ?? 1;

  const total = useMemo(
    () =>
      computeTotal({ base: pkg.price_from, days, adults, children, hotelMultiplier, vehicleDelta: vehicleDelta + mealsCost, addons }),
    [pkg.price_from, days, adults, children, hotelMultiplier, vehicleDelta, mealsCost, addons]
  );

  function toggleAddon(key: string) {
    setAddons((prev) => (prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]));
  }

  if (state.ok && state.request) {
    return <CustomizeConfirmation pkg={pkg} total={total} />;
  }

  const summaryNotes = [
    `Package: ${pkg.name}`,
    pickupLocation && `Pickup location: ${pickupLocation}`,
    `Hotel category: ${hotelCategory}`,
    `Vehicle type: ${vehicleType || "Not specified"}`,
    `Meal preference: ${MEAL_PLANS.find((m) => m.key === mealPlan)?.label}`,
    addons.length > 0 && `Additional sightseeing: ${addons.join(", ")}`,
    notes && `Custom requests: ${notes}`,
    `Estimated total after customization: ${formatINR(total)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
      <motion.form
        action={formAction}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="space-y-10"
      >
        <input type="hidden" name="trip_type" value={tripCategoryMeta(pkg.category)?.label ?? pkg.category ?? "Customized"} />
        <input type="hidden" name="package_slug" value={pkg.slug} />
        <input type="hidden" name="vehicle_type" value={vehicleType} />
        <input type="hidden" name="hotel_category" value={hotelCategory} />
        <input type="hidden" name="computed_total" value={total} />
        <input type="hidden" name="group_size" value={adults + children} />
        <input type="hidden" name="duration_label" value={pkg.duration_label ?? ""} />
        <input type="hidden" name="travel_month" value={startDate && endDate ? `${startDate} to ${endDate}` : ""} />
        <input type="hidden" name="budget_range" value="" />
        <input type="hidden" name="notes" value={summaryNotes} />
        {pkg.places_covered.slice(0, 20).map((place) => (
          <input key={place} type="hidden" name="destinations" value={place} />
        ))}

        <section>
          <StepLabel n={1} title="Travel dates & pickup" icon={<CalendarCheckIcon size={20} loop={false} />} />
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldWrap label="Start date">
              <GlassDatePicker value={startDate} onChange={setStartDate} min={new Date().toISOString().slice(0, 10)} />
            </FieldWrap>
            <FieldWrap label="End date">
              <GlassDatePicker value={endDate} onChange={setEndDate} min={startDate || new Date().toISOString().slice(0, 10)} />
            </FieldWrap>
            <FieldWrap label="Pickup location" className="sm:col-span-2">
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Coimbatore Airport"
                className="input-field"
              />
            </FieldWrap>
          </div>
        </section>

        <section>
          <StepLabel n={2} title="Travellers" />
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldWrap label="Adults">
              <input
                type="number"
                min={1}
                max={30}
                value={adults}
                onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
                className="input-field"
              />
            </FieldWrap>
            <FieldWrap label="Children">
              <input
                type="number"
                min={0}
                max={20}
                value={children}
                onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))}
                className="input-field"
              />
            </FieldWrap>
          </div>
        </section>

        <section>
          <StepLabel n={3} title="Hotel category & vehicle" />
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldWrap label="Hotel category">
              <GlassSelect
                value={hotelCategory}
                onChange={setHotelCategory}
                options={HOTEL_CATEGORIES.map((h) => ({ value: h.key, label: h.label }))}
              />
            </FieldWrap>
            <FieldWrap label="Vehicle type">
              <GlassSelect
                value={vehicleType}
                onChange={setVehicleType}
                options={[
                  ...pkg.vehicle_options.map((v) => ({ value: v, label: v })),
                  ...fleet
                    .filter((v) => !pkg.vehicle_options.includes(v.category))
                    .map((v) => ({ value: v.category, label: `${v.category} (upgrade)` })),
                ]}
              />
            </FieldWrap>
          </div>
        </section>

        <section>
          <StepLabel n={4} title="Meals & sightseeing" icon={<MapPinDropIcon size={20} loop={false} />} />
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Meal preference</label>
            <GlassSelect
              className="max-w-sm"
              value={mealPlan}
              onChange={setMealPlan}
              options={MEAL_PLANS.map((m) => ({ value: m.key, label: m.label }))}
            />
          </div>
          <p className="mt-5 mb-2 text-sm font-medium text-forest-900">Additional sightseeing (optional)</p>
          <div className="flex flex-wrap gap-2">
            {SIGHTSEEING_ADDONS.map((a) => {
              const active = addons.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAddon(a.key)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                    active ? "border-gold-600 bg-gold-50 text-gold-800" : "border-forest-100 bg-white text-charcoal-700 hover:border-forest-300"
                  }`}
                >
                  {a.key} · +{formatINR(a.price)}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <StepLabel n={5} title="Your details" />
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
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Any custom requests?</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Special occasions, accessibility needs, must-see spots..."
              className="w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none transition-colors focus:border-gold-500"
            />
          </div>
        </section>

        {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}

        <Button
          type="submit"
          variant="gold"
          disabled={pending || !phoneValid || !emailOk}
          className="w-full justify-center sm:w-auto"
        >
          {pending ? "Sending..." : "Send Customized Request"}
        </Button>
      </motion.form>

      <aside className="h-fit rounded-3xl border border-forest-100 bg-white p-6 lg:sticky lg:top-28">
        <h3 className="font-display text-lg text-forest-950">Price summary</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Starting price" value={formatINR(pkg.price_from)} />
          <Row label={`Hotel (${hotelCategory})`} value={`×${hotelMultiplier.toFixed(2)}`} />
          {vehicleDelta > 0 && <Row label="Vehicle upgrade" value={`+${formatINR(vehicleDelta)}`} />}
          {mealsCost > 0 && <Row label="Meals" value={`+${formatINR(mealsCost)}`} />}
          {addons.length > 0 && <Row label="Sightseeing add-ons" value={`+${formatINR(addons.reduce((s, k) => s + (SIGHTSEEING_ADDONS.find((a) => a.key === k)?.price ?? 0), 0))}`} />}
        </dl>
        <div className="mt-4 border-t border-forest-100 pt-4">
          <span className="text-xs uppercase tracking-wide text-charcoal-500">Total after customization</span>
          <p className="mt-1 font-display text-2xl text-forest-950">{formatINR(total)}</p>
          <p className="mt-1 text-xs text-charcoal-400">For {adults + children} traveller{adults + children === 1 ? "" : "s"} · {days} day{days === 1 ? "" : "s"}</p>
        </div>
      </aside>
    </div>
  );
}

function CustomizeConfirmation({ pkg, total }: { pkg: TourPackage; total: number }) {
  const [copied, setCopied] = useState(false);
  const summary = `Hello ${site.name}, I'd like to customize the "${pkg.name}" package. Estimated total: ${formatINR(total)}. Could you confirm availability and pricing?`;

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
        <h2 className="mt-4 font-display text-2xl text-forest-950">Your customized request is with us</h2>
        <p className="mt-2 text-sm text-charcoal-500">
          Estimated total: <span className="font-semibold text-forest-900">{formatINR(total)}</span>. Our team will confirm
          exact pricing and availability shortly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={waLink(summary)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white">
            Discuss on WhatsApp
          </a>
          <a href={mailtoLink(`Customized ${pkg.name} request`, summary)} className="inline-flex items-center gap-2 rounded-full border border-forest-200 px-5 py-2.5 text-sm font-semibold text-forest-900">
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
        <Link href={`/packages/${pkg.slug}`} className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:underline">
          Back to package details
          <MotionIcon preset="bounce">
            <ChevronRight size={16} />
          </MotionIcon>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-charcoal-600">
      <dt>{label}</dt>
      <dd className="font-medium text-forest-900">{value}</dd>
    </div>
  );
}

function StepLabel({ n, title, icon }: { n: number; title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-900 text-xs font-semibold text-ivory-50">{n}</span>
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
