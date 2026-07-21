"use client";

import { Suspense, useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Copy, Mail, Minus, Plus, User as UserIcon, Search, Car } from "lucide-react";
import { checkPhoneBookingsAction, createBookingAction, type BookingFormState } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GlassCombobox } from "@/components/ui/GlassCombobox";
import { GlassDateRangePicker } from "@/components/ui/GlassDatePicker";
import { PhoneInput, type PhoneValueInfo } from "@/components/ui/PhoneInput";
import { EmailField } from "@/components/ui/EmailField";
import { CustomTripForm } from "@/components/forms/CustomTripForm";
import {
  CompassIcon,
  SparkleBurstIcon,
  CalendarCheckIcon,
  MapPinDropIcon,
  ShieldBadgeIcon,
} from "@/components/ui/AnimatedIcons";
import { formatINR } from "@/lib/format";
import { site, waLink, mailtoLink } from "@/lib/config/site";
import { calculateBookingAmount, findMatchingTier } from "@/lib/pricing/calc";
import { CAR_TYPES } from "@/lib/db/types";
import type { Destination, PickupLocation } from "@/lib/db/types";
import type { PackageWithTiers } from "@/lib/pricing/service";

const initialState: BookingFormState = { ok: false };
const OTHER_CAR_TYPE = "Others";

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
  packages: PackageWithTiers[];
  destinations: Destination[];
  pickupLocations: PickupLocation[];
  compact?: boolean;
}

export function PlanJourneyForm(props: PlanJourneyFormProps) {
  return (
    <Suspense fallback={null}>
      <PlanJourneyFormInner {...props} />
    </Suspense>
  );
}

function PlanJourneyFormInner({ packages, destinations, pickupLocations, compact = false }: PlanJourneyFormProps) {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(createBookingAction, initialState);
  const [tripType, setTripType] = useState<"package" | "custom">("package");

  const defaultDestination = destinations[0]?.name ?? "Ooty / Nilgiris";
  const [destination, setDestination] = useState(searchParams.get("destination") ?? defaultDestination);
  const [packageSlug, setPackageSlug] = useState(searchParams.get("package") ?? packages[0]?.slug ?? "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") ?? "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? "");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [pickupLocation, setPickupLocation] = useState("");
  const [carType, setCarType] = useState("");
  const [carTypeOther, setCarTypeOther] = useState("");
  const [carDays, setCarDays] = useState<number[]>([]);
  const [carNotes, setCarNotes] = useState("");
  const [phoneInfo, setPhoneInfo] = useState<PhoneValueInfo | null>(null);
  const [phoneBookingCount, setPhoneBookingCount] = useState<number | null>(null);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [emailOk, setEmailOk] = useState(true);

  const effectiveCarType = carType === OTHER_CAR_TYPE ? carTypeOther.trim() || OTHER_CAR_TYPE : carType;

  function handlePhoneChange(info: PhoneValueInfo) {
    setPhoneInfo(info);
    setPhoneBookingCount(null);
    setConfirmDuplicate(false);
  }

  async function handlePhoneBlur(info: PhoneValueInfo) {
    if (!info.valid) return;
    const { count } = await checkPhoneBookingsAction(info.e164);
    setPhoneBookingCount(count);
  }

  const pickupOptions = useMemo(
    () => pickupLocations.map((l) => ({ value: l.label, label: l.label, group: l.city })),
    [pickupLocations]
  );

  const length = useMemo(() => tripLength(startDate, endDate), [startDate, endDate]);
  const selectedPackage = packages.find((p) => p.slug === packageSlug);
  const tier = useMemo(
    () => (length ? findMatchingTier(selectedPackage?.pricing_tiers, length.nights, length.days) : null),
    [selectedPackage, length]
  );

  const dayNumbers = useMemo(
    () => (length ? Array.from({ length: length.days }, (_, i) => i + 1) : []),
    [length]
  );

  function toggleCarDay(day: number) {
    setCarDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)));
  }

  const estimateBreakdown = useMemo(() => {
    if (!selectedPackage) return null;
    return calculateBookingAmount({
      basePrice: selectedPackage.price_from,
      tier,
      adults,
      children,
      carType: effectiveCarType || null,
      carDays,
    });
  }, [selectedPackage, tier, adults, children, effectiveCarType, carDays]);

  const estimate = estimateBreakdown?.total ?? 0;

  function handleStartDateChange(value: string) {
    setStartDate(value);
    if (endDate && endDate < value) setEndDate(value);
  }

  if (tripType === "custom") {
    return (
      <div className={compact ? "glass-card w-full max-w-md overflow-visible rounded-[2rem] p-6 shadow-[0_32px_70px_-28px_rgba(11,59,46,0.4)] ring-1 ring-gold-200/50 sm:p-7 lg:ml-auto" : ""}>
        <TripTypeToggle tripType={tripType} onChange={setTripType} compact={compact} />
        <div className="mt-5">
          <CustomTripForm destinations={destinations} />
        </div>
      </div>
    );
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

        <TripTypeToggle tripType={tripType} onChange={setTripType} compact />

        <p className="mb-5 mt-3 text-sm text-charcoal-500">Two minutes to plan — no account needed.</p>

        <input type="hidden" name="destination" value={selectedPackage?.name ?? destination} />
        <input type="hidden" name="pickupLocation" value={pickupLocation} />
        <input type="hidden" name="carType" value={effectiveCarType} />
        <input type="hidden" name="carDays" value={JSON.stringify(carDays)} />
        <input type="hidden" name="confirmDuplicate" value={confirmDuplicate ? "true" : "false"} />

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
            <GlassCombobox
              size="sm"
              variant="subtle"
              placeholder="Search Coimbatore, Ooty, Mysore..."
              value={pickupLocation}
              onChange={setPickupLocation}
              options={pickupOptions}
            />
          </CompactField>

          <div className="grid grid-cols-2 gap-3">
            <StepperField label="Adults" value={adults} onChange={setAdults} min={1} max={30} name="adults" />
            <StepperField label="Children" value={children} onChange={setChildren} min={0} max={20} name="children" />
          </div>

          {dayNumbers.length > 0 && (
            <CarRequirementFields
              dayNumbers={dayNumbers}
              carType={carType}
              onCarTypeChange={setCarType}
              carTypeOther={carTypeOther}
              onCarTypeOtherChange={setCarTypeOther}
              carDays={carDays}
              onToggleDay={toggleCarDay}
              carNotes={carNotes}
              onCarNotesChange={setCarNotes}
              compact
            />
          )}
          <input type="hidden" name="carNotes" value={carNotes} />

          <CompactField label="Full name">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">
                <UserIcon size={16} />
              </span>
              <input type="text" name="name" required placeholder="Your name" className="input-field pl-10 text-sm" />
            </div>
          </CompactField>

          <CompactField label="Mobile number">
            <PhoneInput
              name="phone"
              required
              size="sm"
              variant="subtle"
              onValueChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
            />
          </CompactField>

          {phoneBookingCount != null && phoneBookingCount > 0 && (
            <DuplicatePhoneConfirm
              count={phoneBookingCount}
              confirmed={confirmDuplicate}
              onChange={setConfirmDuplicate}
            />
          )}

          <CompactField label="Email (optional)">
            <EmailField
              name="email"
              size="sm"
              icon={<Mail size={16} />}
              onValueChange={(info) => setEmailOk(info.valid || info.value === "")}
            />
          </CompactField>
        </div>

        {state.error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending || (!!phoneBookingCount && !confirmDuplicate) || !phoneInfo?.valid || !emailOk}
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
      <input type="hidden" name="pickupLocation" value={pickupLocation} />
      <input type="hidden" name="carType" value={effectiveCarType} />
      <input type="hidden" name="carDays" value={JSON.stringify(carDays)} />
      <input type="hidden" name="carNotes" value={carNotes} />
      <input type="hidden" name="confirmDuplicate" value={confirmDuplicate ? "true" : "false"} />

      <div className="space-y-10">
        <TripTypeToggle tripType={tripType} onChange={setTripType} />

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
                {tier && <span className="text-forest-700"> · package rate applied</span>}
              </p>
            )}
            <FieldWrap label="Pickup location" className="sm:col-span-2" icon={<MapPinDropIcon size={16} loop={false} />}>
              <GlassCombobox
                placeholder="Search Coimbatore, Ooty, Mysore pickup points..."
                value={pickupLocation}
                onChange={setPickupLocation}
                options={pickupOptions}
                className="pl-0"
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

        {dayNumbers.length > 0 && (
          <section>
            <StepLabel n={3} title="Car requirements" icon={<Car size={20} />} />
            <CarRequirementFields
              dayNumbers={dayNumbers}
              carType={carType}
              onCarTypeChange={setCarType}
              carTypeOther={carTypeOther}
              onCarTypeOtherChange={setCarTypeOther}
              carDays={carDays}
              onToggleDay={toggleCarDay}
              carNotes={carNotes}
              onCarNotesChange={setCarNotes}
            />
          </section>
        )}

        <section>
          <StepLabel n={dayNumbers.length > 0 ? 4 : 3} title="Your details" />
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldWrap label="Full name" icon={<UserIcon size={16} />}>
              <input type="text" name="name" required className="input-field pl-10" />
            </FieldWrap>
            <FieldWrap label="Mobile number">
              <PhoneInput name="phone" required onValueChange={handlePhoneChange} onBlur={handlePhoneBlur} />
            </FieldWrap>
            <FieldWrap label="Email (optional)">
              <EmailField
                name="email"
                icon={<Mail size={16} />}
                onValueChange={(info) => setEmailOk(info.valid || info.value === "")}
              />
            </FieldWrap>
          </div>

          {phoneBookingCount != null && phoneBookingCount > 0 && (
            <div className="mt-4">
              <DuplicatePhoneConfirm
                count={phoneBookingCount}
                confirmed={confirmDuplicate}
                onChange={setConfirmDuplicate}
              />
            </div>
          )}
        </section>

        {state.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
        )}

        <Button
          type="submit"
          variant="gold"
          disabled={pending || (!!phoneBookingCount && !confirmDuplicate) || !phoneInfo?.valid || !emailOk}
          className="w-full justify-center sm:w-auto"
        >
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
          {pickupLocation && (
            <div className="flex justify-between">
              <span>Pickup</span>
              <span className="text-right">{pickupLocation}</span>
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
          {effectiveCarType && (
            <div className="flex justify-between">
              <span>Car type</span>
              <span>{effectiveCarType}</span>
            </div>
          )}
          {carDays.length > 0 && (
            <div className="flex justify-between">
              <span>Car days</span>
              <span>{carDays.map((d) => `Day ${d}`).join(", ")}</span>
            </div>
          )}
        </div>
        <p className="mt-6 flex items-center gap-2 border-t border-forest-100 pt-4 text-xs text-charcoal-500">
          <ShieldBadgeIcon size={16} className="text-forest-600" />
          No payment now — pay securely once our team confirms your booking.
        </p>
      </aside>
    </motion.form>
  );
}

function TripTypeToggle({
  tripType,
  onChange,
  compact = false,
}: {
  tripType: "package" | "custom";
  onChange: (t: "package" | "custom") => void;
  compact?: boolean;
}) {
  return (
    <div className={`inline-flex rounded-full border border-forest-200 bg-white p-1 ${compact ? "w-full" : ""}`}>
      {(
        [
          { key: "package", label: "Ready-made package" },
          { key: "custom", label: "Custom / build my own trip" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
            compact ? "flex-1" : ""
          } ${
            tripType === opt.key
              ? "bg-forest-900 text-ivory-50"
              : "text-forest-700 hover:bg-forest-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function DuplicatePhoneConfirm({
  count,
  confirmed,
  onChange,
}: {
  count: number;
  confirmed: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2.5 rounded-xl border border-gold-200 bg-gold-50 p-3 text-xs text-gold-900">
      <input
        type="checkbox"
        checked={confirmed}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-gold-600"
      />
      <span>
        This mobile number already has {count} booking{count === 1 ? "" : "s"} with us. Check this box to confirm
        you&rsquo;d like to create another one.
      </span>
    </label>
  );
}

function CarRequirementFields({
  dayNumbers,
  carType,
  onCarTypeChange,
  carTypeOther,
  onCarTypeOtherChange,
  carDays,
  onToggleDay,
  carNotes,
  onCarNotesChange,
  compact = false,
}: {
  dayNumbers: number[];
  carType: string;
  onCarTypeChange: (v: string) => void;
  carTypeOther: string;
  onCarTypeOtherChange: (v: string) => void;
  carDays: number[];
  onToggleDay: (day: number) => void;
  carNotes: string;
  onCarNotesChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "mt-4 space-y-4"}>
      {compact && (
        <p className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-forest-500">
          Car requirements (optional)
        </p>
      )}
      <div className={compact ? "" : "grid grid-cols-1 gap-5 sm:grid-cols-2"}>
        <div>
          {!compact && <label className="mb-1.5 block text-sm font-medium text-forest-900">Car type</label>}
          <GlassSelect
            size={compact ? "sm" : "md"}
            variant={compact ? "subtle" : "default"}
            placeholder="No car needed"
            value={carType}
            onChange={onCarTypeChange}
            options={[
              { value: "", label: "No car needed" },
              ...CAR_TYPES.map((c) => ({ value: c, label: c })),
              { value: OTHER_CAR_TYPE, label: "Others (specify)" },
            ]}
          />
          {carType === OTHER_CAR_TYPE && (
            <input
              type="text"
              value={carTypeOther}
              onChange={(e) => onCarTypeOtherChange(e.target.value)}
              placeholder="Tell us what vehicle you need (optional)"
              className={`input-field mt-2 ${compact ? "text-sm" : ""}`}
            />
          )}
        </div>
      </div>

      {carType && (
        <div className="mt-3">
          {!compact && <label className="mb-1.5 block text-sm font-medium text-forest-900">Which days do you need the car?</label>}
          <div className="flex flex-wrap gap-2">
            {dayNumbers.map((day) => {
              const active = carDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onToggleDay(day)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    active ? "border-gold-600 bg-gold-50 text-gold-800" : "border-forest-200 bg-white text-charcoal-700 hover:border-forest-400"
                  }`}
                >
                  Day {day} {active ? "✓" : ""}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={carNotes}
            onChange={(e) => onCarNotesChange(e.target.value)}
            placeholder="Notes for the driver (optional)"
            className="input-field mt-3 text-sm"
          />
        </div>
      )}
    </div>
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
