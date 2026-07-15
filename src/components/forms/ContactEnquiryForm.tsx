"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft, ChevronRight, AlertCircle, User, Phone, Mail, Copy } from "lucide-react";
import { submitContactMessage, type ContactFormState } from "@/lib/actions/public";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { GlassDatePicker } from "@/components/ui/GlassDatePicker";
import { WhatsAppGlyphIcon } from "@/components/ui/BrandIcons";
import { CalendarCheckIcon, CompassIcon, MapPinDropIcon, ShieldBadgeIcon, SparkleBurstIcon } from "@/components/ui/AnimatedIcons";
import { TRIP_CATEGORIES } from "@/lib/config/tripCategories";
import { site, waLink, mailtoLink } from "@/lib/config/site";
import type { Destination, FleetVehicle } from "@/lib/db/types";

const ease = [0.22, 1, 0.36, 1] as const;
const initialState: ContactFormState = { ok: false };

const HOTEL_CATEGORIES = ["Standard", "Deluxe", "Premium", "Luxury"];
const BUDGET_RANGES = ["Under ₹15,000", "₹15,000 – ₹30,000", "₹30,000 – ₹50,000", "₹50,000+", "Not sure yet"];
const COUNTRIES = [
  "India",
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  "Singapore",
  "Australia",
  "Canada",
  "Malaysia",
  "Germany",
  "Other",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

interface StepState {
  destination: string;
  packageType: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  vehicleType: string;
  hotelCategory: string;
  budgetRange: string;
  pickupLocation: string;
  specialRequirements: string;
  fullName: string;
  mobile: string;
  whatsappSame: boolean;
  whatsapp: string;
  email: string;
  country: string;
  state: string;
  city: string;
}

const STEPS = ["Trip Details", "Preferences", "Your Details"] as const;

export function ContactEnquiryForm({
  destinations,
  fleet,
}: {
  destinations: Destination[];
  fleet: FleetVehicle[];
}) {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const vehicleTypes = useMemo(
    () => Array.from(new Set(fleet.map((f) => f.category))).filter(Boolean),
    [fleet]
  );

  const [form, setForm] = useState<StepState>({
    destination: destinations[0]?.name ?? "",
    packageType: TRIP_CATEGORIES[0]?.key ?? "",
    startDate: "",
    endDate: "",
    adults: 2,
    children: 0,
    vehicleType: vehicleTypes[0] ?? "",
    hotelCategory: "Standard",
    budgetRange: "",
    pickupLocation: "",
    specialRequirements: "",
    fullName: "",
    mobile: "",
    whatsappSame: true,
    whatsapp: "",
    email: "",
    country: "India",
    state: "",
    city: "",
  });

  function set<K extends keyof StepState>(key: K, value: StepState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function markTouched(key: string) {
    setTouched((t) => ({ ...t, [key]: true }));
  }

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.destination) e.destination = "Please choose a destination";
    if (!form.startDate) e.startDate = "Pick a travel date";
    if (!form.endDate) e.endDate = "Pick a return date";
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = "Return date must be after travel date";
    if (!form.fullName || form.fullName.trim().length < 2) e.fullName = "Enter your full name";
    const mobileDigits = digitsOnly(form.mobile);
    if (mobileDigits.length < 10) e.mobile = "Enter a valid 10-digit mobile number";
    if (!form.whatsappSame) {
      const waDigits = digitsOnly(form.whatsapp);
      if (waDigits.length < 10) e.whatsapp = "Enter a valid WhatsApp number";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.state.trim()) e.state = "Enter your state";
    if (!form.city.trim()) e.city = "Enter your city";
    return e;
  }, [form]);

  const stepFields: Record<number, string[]> = {
    0: ["destination", "startDate", "endDate"],
    1: [],
    2: ["fullName", "mobile", "whatsapp", "email", "state", "city"],
  };

  function stepHasErrors(i: number) {
    return stepFields[i].some((f) => errors[f]);
  }

  function goNext() {
    stepFields[step].forEach(markTouched);
    if (stepHasErrors(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  const whatsappValue = form.whatsappSame ? form.mobile : form.whatsapp;

  const summary = useMemo(() => {
    const pkg = TRIP_CATEGORIES.find((c) => c.key === form.packageType)?.label ?? form.packageType;
    return [
      `New multi-step trip enquiry from the website.`,
      `Destination: ${form.destination || "Not specified"}`,
      `Package type: ${pkg || "Not specified"}`,
      `Travel dates: ${form.startDate || "TBD"} to ${form.endDate || "TBD"}`,
      `Travellers: ${form.adults} adult(s), ${form.children} child(ren)`,
      `Vehicle type: ${form.vehicleType || "Not specified"}`,
      `Hotel category: ${form.hotelCategory || "Not specified"}`,
      `Budget range: ${form.budgetRange || "Not specified"}`,
      `Pickup location: ${form.pickupLocation || "Not specified"}`,
      `WhatsApp number: ${whatsappValue || "Not specified"}`,
      `Location: ${[form.city, form.state, form.country].filter(Boolean).join(", ") || "Not specified"}`,
      `Special requirements: ${form.specialRequirements || "None"}`,
    ].join("\n");
  }, [form, whatsappValue]);

  const subject = `Trip enquiry — ${form.packageType || "General"} to ${form.destination || "Ooty"}`;

  if (state.ok) {
    return <EnquirySuccess summary={summary} />;
  }

  return (
    <motion.form
      id="enquiry-form"
      action={formAction}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease }}
      className="glass-card relative overflow-hidden rounded-[2rem] p-6 shadow-[0_32px_80px_-32px_rgba(11,59,46,0.35)] sm:p-10"
    >
      <input type="hidden" name="name" value={form.fullName} />
      <input type="hidden" name="phone" value={form.mobile} />
      <input type="hidden" name="email" value={form.email} />
      <input type="hidden" name="subject" value={subject} />
      <input type="hidden" name="message" value={summary} />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-display text-2xl text-forest-950">Plan Your Enquiry</p>
          <p className="mt-1 text-sm text-charcoal-500">Three quick steps — our team replies within hours.</p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-700 sm:inline-flex">
          <ShieldBadgeIcon size={14} loop={false} /> No payment required
        </span>
      </div>

      <Stepper step={step} />

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease }}
              className="space-y-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldLabel label="Destination" icon={<MapPinDropIcon size={15} loop={false} />}>
                  <GlassSelect
                    value={form.destination}
                    onChange={(v) => set("destination", v)}
                    options={destinations.map((d) => ({ value: d.name, label: d.name }))}
                    placeholder="Choose a destination"
                  />
                </FieldLabel>
                <FieldLabel label="Package type" icon={<CompassIcon size={15} loop={false} />}>
                  <GlassSelect
                    value={form.packageType}
                    onChange={(v) => set("packageType", v)}
                    options={TRIP_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
                    placeholder="Choose a package"
                  />
                </FieldLabel>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FieldLabel label="Travel date" error={touched.startDate ? errors.startDate : undefined}>
                  <GlassDatePicker
                    value={form.startDate}
                    onChange={(v) => {
                      set("startDate", v);
                      if (form.endDate && form.endDate < v) set("endDate", v);
                      markTouched("startDate");
                    }}
                    min={todayISO()}
                  />
                </FieldLabel>
                <FieldLabel label="Return date" error={touched.endDate ? errors.endDate : undefined}>
                  <GlassDatePicker
                    value={form.endDate}
                    onChange={(v) => {
                      set("endDate", v);
                      markTouched("endDate");
                    }}
                    min={form.startDate || todayISO()}
                  />
                </FieldLabel>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Stepper2 label="Adults" value={form.adults} onChange={(v) => set("adults", v)} min={1} max={30} />
                <Stepper2 label="Children" value={form.children} onChange={(v) => set("children", v)} min={0} max={20} />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease }}
              className="space-y-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldLabel label="Vehicle type">
                  <GlassSelect
                    value={form.vehicleType}
                    onChange={(v) => set("vehicleType", v)}
                    options={vehicleTypes.map((v) => ({ value: v, label: v }))}
                    placeholder="Any / no preference"
                  />
                </FieldLabel>
                <FieldLabel label="Hotel category">
                  <GlassSelect
                    value={form.hotelCategory}
                    onChange={(v) => set("hotelCategory", v)}
                    options={HOTEL_CATEGORIES.map((h) => ({ value: h, label: h }))}
                  />
                </FieldLabel>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldLabel label="Budget range">
                  <GlassSelect
                    value={form.budgetRange}
                    onChange={(v) => set("budgetRange", v)}
                    options={BUDGET_RANGES.map((b) => ({ value: b, label: b }))}
                    placeholder="Select a range"
                  />
                </FieldLabel>
                <FloatingInput
                  label="Pickup location"
                  value={form.pickupLocation}
                  onChange={(v) => set("pickupLocation", v)}
                  placeholder="Coimbatore Airport, hotel..."
                />
              </div>
              <FloatingTextarea
                label="Special requirements"
                value={form.specialRequirements}
                onChange={(v) => set("specialRequirements", v)}
                placeholder="Accessibility needs, celebrations, dietary preferences..."
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease }}
              className="space-y-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FloatingInput
                  label="Full name"
                  icon={<User size={15} />}
                  value={form.fullName}
                  onChange={(v) => set("fullName", v)}
                  onBlur={() => markTouched("fullName")}
                  error={touched.fullName ? errors.fullName : undefined}
                  valid={touched.fullName && !errors.fullName}
                  required
                />
                <FloatingInput
                  label="Mobile number"
                  type="tel"
                  icon={<Phone size={15} />}
                  value={form.mobile}
                  onChange={(v) => set("mobile", v)}
                  onBlur={() => markTouched("mobile")}
                  error={touched.mobile ? errors.mobile : undefined}
                  valid={touched.mobile && !errors.mobile}
                  required
                />
              </div>

              <div>
                <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-medium text-forest-700">
                  <input
                    type="checkbox"
                    checked={form.whatsappSame}
                    onChange={(e) => set("whatsappSame", e.target.checked)}
                    className="h-4 w-4 rounded border-forest-300 text-gold-600 focus:ring-gold-400"
                  />
                  WhatsApp number is the same as my mobile number
                </label>
                {!form.whatsappSame && (
                  <div className="mt-3">
                    <FloatingInput
                      label="WhatsApp number"
                      type="tel"
                      icon={<WhatsAppGlyphIcon size={14} />}
                      value={form.whatsapp}
                      onChange={(v) => set("whatsapp", v)}
                      onBlur={() => markTouched("whatsapp")}
                      error={touched.whatsapp ? errors.whatsapp : undefined}
                      valid={touched.whatsapp && !errors.whatsapp}
                    />
                  </div>
                )}
              </div>

              <FloatingInput
                label="Email (optional)"
                type="email"
                icon={<Mail size={15} />}
                value={form.email}
                onChange={(v) => set("email", v)}
                onBlur={() => markTouched("email")}
                error={touched.email ? errors.email : undefined}
                valid={touched.email && !!form.email && !errors.email}
              />

              <div className="grid gap-5 sm:grid-cols-3">
                <FieldLabel label="Country">
                  <GlassSelect
                    value={form.country}
                    onChange={(v) => set("country", v)}
                    options={COUNTRIES.map((c) => ({ value: c, label: c }))}
                  />
                </FieldLabel>
                <FloatingInput
                  label="State"
                  value={form.state}
                  onChange={(v) => set("state", v)}
                  onBlur={() => markTouched("state")}
                  error={touched.state ? errors.state : undefined}
                  valid={touched.state && !errors.state}
                  required
                />
                <FloatingInput
                  label="City"
                  value={form.city}
                  onChange={(v) => set("city", v)}
                  onBlur={() => markTouched("city")}
                  error={touched.city ? errors.city : undefined}
                  valid={touched.city && !errors.city}
                  required
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {state.error && (
        <p className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} /> {state.error}
        </p>
      )}

      <div className="mt-9 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 px-5 py-3 text-sm font-semibold text-forest-800 transition-all duration-300 hover:border-forest-400 disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="group inline-flex items-center gap-2 rounded-full bg-forest-900 px-7 py-3.5 text-sm font-semibold text-ivory-50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-600 hover:text-forest-950"
          >
            Continue
            <MotionIcon preset="bounce">
              <ChevronRight size={16} />
            </MotionIcon>
          </button>
        ) : (
          <motion.button
            type="submit"
            disabled={pending || stepHasErrors(2)}
            whileHover={{ scale: pending ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-2 rounded-full bg-gold-600 px-8 py-3.5 text-sm font-semibold text-forest-950 transition-all duration-300 hover:bg-gold-700 hover:shadow-[0_16px_36px_-10px_rgba(200,161,92,0.6)] disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? "Sending..." : "Submit Enquiry"}
            {!pending && (
              <MotionIcon preset="pop">
                <SparkleBurstIcon size={16} loop={false} />
              </MotionIcon>
            )}
          </motion.button>
        )}
      </div>
    </motion.form>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2.5">
            <motion.span
              animate={{
                backgroundColor: i <= step ? "#c8a15c" : "#e4eee9",
                color: i <= step ? "#071f18" : "#59584f",
              }}
              transition={{ duration: 0.3 }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              {i < step ? <Check size={13} /> : i + 1}
            </motion.span>
            <span className={`hidden text-xs font-semibold sm:inline ${i <= step ? "text-forest-950" : "text-charcoal-500"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="h-px flex-1 bg-forest-100">
              <motion.div
                className="h-px bg-gold-500"
                animate={{ width: i < step ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Stepper2({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-forest-500">{label}</label>
      <div className="flex items-center justify-between rounded-xl border border-forest-200 bg-white px-3 py-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-forest-50"
        >
          −
        </button>
        <span className="text-sm font-semibold text-forest-950">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-forest-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  children,
  icon,
  error,
}: {
  label: string;
  children: ReactNode;
  icon?: ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forest-500">
        {icon}
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function FloatingInput({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  icon,
  error,
  valid,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  icon?: ReactNode;
  error?: string;
  valid?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">{icon}</span>}
        <input
          type={type}
          value={value}
          required={required}
          placeholder={floated ? placeholder : undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          className={`input-field ${icon ? "pl-10" : ""} ${valid ? "pr-10" : ""} pt-3.5 ${
            error ? "border-red-400 focus:border-red-500" : valid ? "border-forest-400" : ""
          }`}
        />
        <motion.label
          initial={false}
          animate={{
            top: floated ? "0.45rem" : "50%",
            fontSize: floated ? "0.65rem" : "0.875rem",
            y: floated ? 0 : "-50%",
          }}
          transition={{ duration: 0.18, ease }}
          className={`pointer-events-none absolute origin-left font-medium ${icon ? "left-10" : "left-4"} ${
            floated ? "text-gold-700" : "text-charcoal-500"
          }`}
        >
          {label}
          {required && " *"}
        </motion.label>
        {valid && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-600">
            <Check size={15} />
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function FloatingTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div className="relative">
      <textarea
        rows={4}
        value={value}
        placeholder={floated ? placeholder : undefined}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="input-field pt-5"
      />
      <motion.label
        initial={false}
        animate={{ top: floated ? "0.5rem" : "0.9rem", fontSize: floated ? "0.65rem" : "0.875rem" }}
        transition={{ duration: 0.18, ease }}
        className={`pointer-events-none absolute left-4 origin-left font-medium ${floated ? "text-gold-700" : "text-charcoal-500"}`}
      >
        {label}
      </motion.label>
    </div>
  );
}

function EnquirySuccess({ summary }: { summary: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease }}
      className="glass-card rounded-[2rem] p-10 text-center shadow-[0_32px_80px_-32px_rgba(11,59,46,0.35)] sm:p-14"
    >
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 16 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-900 text-gold-400"
      >
        <CalendarCheckIcon size={30} loop={false} />
      </motion.span>
      <h3 className="mt-5 font-display text-2xl text-forest-950">Your enquiry is with us</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-charcoal-500">
        Thank you — one of our Nilgiris travel experts will reach out shortly with a tailored plan.
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
          href={mailtoLink(`Trip enquiry — ${site.name}`, summary)}
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
          {copied ? "Copied" : "Copy summary"}
        </button>
      </div>
    </motion.div>
  );
}
