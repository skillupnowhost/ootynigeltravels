"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, AlertCircle, Search } from "lucide-react";
import { COUNTRIES, examplePlaceholder, flagEmoji, getCountry, validatePhone } from "@/lib/validation/phone";

const noopSubscribe = () => () => {};
/** SSR-safe "are we in the browser yet" check for the portal target — avoids a hydration mismatch without an effect-based mounted flag. */
function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export interface PhoneValueInfo {
  e164: string;
  valid: boolean;
  iso2: string;
  error: string | null;
}

interface PhoneInputProps {
  name: string;
  required?: boolean;
  defaultCountry?: string;
  onValueChange?: (info: PhoneValueInfo) => void;
  onBlur?: (info: PhoneValueInfo) => void;
  size?: "sm" | "md";
  variant?: "default" | "subtle";
  className?: string;
  disabled?: boolean;
}

/**
 * Full international phone input: searchable country selector (flag, name,
 * ISO code, dial code) plus a national-number field that validates in real
 * time and assembles the final value as E.164 for submission.
 */
export function PhoneInput({
  name,
  required = false,
  defaultCountry = "IN",
  onValueChange,
  onBlur,
  size = "md",
  variant = "default",
  className = "",
  disabled = false,
}: PhoneInputProps) {
  const [iso2, setIso2] = useState(defaultCountry);
  const [national, setNational] = useState("");
  const [touched, setTouched] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const country = getCountry(iso2);
  const result = useMemo(() => validatePhone(iso2, national), [iso2, national]);
  const digitCount = national.replace(/\D/g, "").length;
  const showFeedback = digitCount >= 3;

  const info: PhoneValueInfo = { e164: result.e164, valid: result.valid, iso2, error: result.error };

  useEffect(() => {
    onValueChange?.(info);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.e164, result.valid, iso2]);

  const sizeClasses = size === "sm" ? "px-3.5 py-2 text-sm" : "px-4 py-3 text-sm";

  return (
    <div className={className}>
      <div
        className={`input-field ${
          variant === "subtle" ? "input-field-subtle" : ""
        } flex items-stretch gap-0 p-0 ${
          touched && showFeedback && !result.valid && digitCount > 0
            ? "border-red-400 focus-within:border-red-500"
            : touched && result.valid
              ? "border-forest-400"
              : "focus-within:border-gold-600"
        }`}
      >
        <CountrySelector
          iso2={iso2}
          onSelect={(next) => {
            setIso2(next);
            setCountryOpen(false);
          }}
          open={countryOpen}
          onOpenChange={setCountryOpen}
          size={size}
        />
        <span className="my-2 w-px shrink-0 bg-forest-200" aria-hidden />
        <input
          type="tel"
          inputMode="tel"
          disabled={disabled}
          value={national}
          onChange={(e) => {
            const raw = e.target.value;
            // Only digits and display formatting characters are ever allowed through.
            setNational(raw.replace(/[^\d\s\-()]/g, ""));
          }}
          onBlur={() => {
            setTouched(true);
            onBlur?.(info);
          }}
          placeholder={examplePlaceholder(iso2)}
          aria-label="Phone number"
          className={`min-w-0 flex-1 bg-transparent outline-none ${sizeClasses}`}
        />
        {digitCount > 0 && (
          <span className="flex items-center pr-3.5">
            {result.valid ? (
              <Check size={16} className="text-forest-600" />
            ) : showFeedback ? (
              <AlertCircle size={16} className="text-red-500" />
            ) : null}
          </span>
        )}
      </div>
      <input type="hidden" name={name} value={result.e164} required={required} readOnly />
      {touched && showFeedback && result.error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} /> {result.error}
        </p>
      )}
      <p className="mt-1 text-[11px] text-charcoal-400">
        e.g. +{country.dialCode} {examplePlaceholder(iso2)}
      </p>
    </div>
  );
}

interface PanelCoords {
  top: number;
  left: number;
  width: number;
}

function CountrySelector({
  iso2,
  onSelect,
  open,
  onOpenChange,
  size,
}: {
  iso2: string;
  onSelect: (iso2: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size: "sm" | "md";
}) {
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<PanelCoords | null>(null);
  const mounted = useIsClient();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const country = getCountry(iso2);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.iso2.toLowerCase().includes(q) || c.dialCode.includes(q)
    );
  }, [query]);

  function measure() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({ top: rect.bottom + 8, left: rect.left, width: Math.max(rect.width, 288) });
  }

  useEffect(() => {
    if (!open) return;
    measure();
    const t = setTimeout(() => searchRef.current?.focus(), 20);
    function onReposition() {
      measure();
    }
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setQuery("");
      onOpenChange(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onOpenChange]);

  function closeAndReset() {
    setQuery("");
    onOpenChange(false);
  }

  const buttonPad = size === "sm" ? "px-2.5 py-2 text-sm" : "px-3 py-3 text-sm";

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? closeAndReset() : onOpenChange(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-l-[0.7rem] font-medium text-charcoal-900 transition-colors hover:bg-forest-50/60 ${buttonPad}`}
      >
        <span className="text-base leading-none" aria-hidden>
          {flagEmoji(country.iso2)}
        </span>
        <span className="text-charcoal-700">+{country.dialCode}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-forest-500">
          <ChevronDown size={14} />
        </motion.span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && coords && (
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "fixed", top: coords.top, left: coords.left, width: coords.width }}
                className="z-[100] overflow-hidden rounded-2xl border border-forest-200 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(11,59,46,0.45)]"
              >
                <div className="relative mb-1.5">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest-500" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full rounded-xl border border-forest-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-gold-500"
                  />
                </div>
                <ul role="listbox" id={listId} className="max-h-64 overflow-auto">
                  {filtered.length === 0 && (
                    <li className="px-3 py-2.5 text-sm text-charcoal-500">No matching country</li>
                  )}
                  {filtered.map((c) => (
                    <li
                      key={c.iso2}
                      role="option"
                      aria-selected={c.iso2 === iso2}
                      onClick={() => {
                        setQuery("");
                        onSelect(c.iso2);
                      }}
                      className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
                        c.iso2 === iso2 ? "bg-gold-100/70 text-forest-950" : "text-charcoal-900 hover:bg-forest-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base leading-none" aria-hidden>
                          {flagEmoji(c.iso2)}
                        </span>
                        <span>{c.name}</span>
                        <span className="text-charcoal-400">({c.iso2})</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-charcoal-500">
                        +{c.dialCode}
                        {c.iso2 === iso2 && <Check size={13} className="text-gold-700" />}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
