"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABEL = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const DAY_LABEL = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fromISO(iso: string | undefined): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMonthGrid(monthAnchor: Date): (Date | null)[] {
  const first = startOfMonth(monthAnchor);
  const leading = first.getDay();
  const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isSameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBefore(a: Date, b: Date) {
  return toISO(a) < toISO(b);
}

function Popover({
  monthAnchor,
  setMonthAnchor,
  min,
  max,
  children,
}: {
  monthAnchor: Date;
  setMonthAnchor: (d: Date) => void;
  min?: Date | null;
  max?: Date | null;
  children: (grid: (Date | null)[]) => React.ReactNode;
}) {
  const grid = buildMonthGrid(monthAnchor);
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="glass-popover absolute left-0 right-0 top-[calc(100%+8px)] z-50 w-[min(92vw,300px)] rounded-2xl p-4 sm:right-auto"
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1))}
          disabled={!!min && new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 0) < startOfMonth(min)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold text-forest-950">{MONTH_LABEL.format(monthAnchor)}</p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1))}
          disabled={!!max && startOfMonth(monthAnchor) >= startOfMonth(max)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      {children(grid)}
    </motion.div>
  );
}

function DayCell({
  date,
  disabled,
  selected,
  inRange,
  isToday,
  onClick,
}: {
  date: Date;
  disabled: boolean;
  selected: boolean;
  inRange?: boolean;
  isToday: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all duration-150 ${
        selected
          ? "bg-gold-600 font-semibold text-forest-950 shadow-[0_4px_14px_-4px_rgba(200,161,92,0.7)]"
          : inRange
            ? "bg-gold-100/70 text-forest-900"
            : disabled
              ? "cursor-not-allowed text-charcoal-500/30"
              : "text-charcoal-900 hover:bg-forest-50"
      } ${isToday && !selected ? "ring-1 ring-inset ring-forest-400" : ""}`}
    >
      {date.getDate()}
    </button>
  );
}

interface GlassDatePickerProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (iso: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  variant?: "default" | "subtle";
}

/** Glassmorphism replacement for <input type="date"> — a custom calendar popover,
 * since native date pickers render inconsistently across browsers. */
export function GlassDatePicker({
  name,
  value,
  defaultValue,
  onChange,
  min,
  max,
  placeholder = "Select date",
  required = false,
  className = "",
  variant = "default",
}: GlassDatePickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = isControlled ? value : internal;
  const currentDate = fromISO(current);
  const minDate = fromISO(min);
  const maxDate = fromISO(max);

  const [open, setOpen] = useState(false);
  const [monthAnchor, setMonthAnchor] = useState(currentDate ?? minDate ?? new Date());
  const rootRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function commit(d: Date) {
    const iso = toISO(d);
    if (!isControlled) setInternal(iso);
    onChange?.(iso);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={current} required={required} />}
      <button
        type="button"
        onClick={() => {
          setMonthAnchor(currentDate ?? minDate ?? new Date());
          setOpen((v) => !v);
        }}
        className={`glass-select ${variant === "subtle" ? "glass-select-subtle" : ""} flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm text-charcoal-900 outline-none transition-all duration-200 ${
          open ? "border-gold-500/70 ring-2 ring-gold-400/30" : "hover:border-gold-400/60"
        }`}
      >
        <span className={currentDate ? "" : "text-charcoal-500"}>
          {currentDate ? DAY_LABEL.format(currentDate) : placeholder}
        </span>
        <CalendarDays size={16} className="shrink-0 text-forest-600" />
      </button>

      <AnimatePresence>
        {open && (
          <Popover monthAnchor={monthAnchor} setMonthAnchor={setMonthAnchor} min={minDate} max={maxDate}>
            {(grid) => (
              <div className="mt-1 grid grid-cols-7 gap-1">
                {grid.map((date, i) => {
                  if (!date) return <span key={i} />;
                  const disabled = (!!minDate && isBefore(date, minDate)) || (!!maxDate && isBefore(maxDate, date));
                  return (
                    <DayCell
                      key={i}
                      date={date}
                      disabled={disabled}
                      selected={isSameDay(date, currentDate)}
                      isToday={isSameDay(date, today)}
                      onClick={() => commit(date)}
                    />
                  );
                })}
              </div>
            )}
          </Popover>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GlassDateRangePickerProps {
  startName?: string;
  endName?: string;
  startValue: string;
  endValue: string;
  onStartChange: (iso: string) => void;
  onEndChange: (iso: string) => void;
  min?: string;
  startLabel?: string;
  endLabel?: string;
  className?: string;
  required?: boolean;
  variant?: "default" | "subtle";
}

/** One shared calendar for a start/end date pair — first click sets the start date
 * (clearing any end date before it), second click sets the end date. Mirrors the
 * clamp-end-to-start behaviour PlanJourneyForm already enforces. */
export function GlassDateRangePicker({
  startName,
  endName,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  min,
  startLabel = "Check-in",
  endLabel = "Check-out",
  className = "",
  required = false,
  variant = "default",
}: GlassDateRangePickerProps) {
  const startDate = fromISO(startValue);
  const endDate = fromISO(endValue);
  const minDate = fromISO(min);

  const [open, setOpen] = useState(false);
  const [monthAnchor, setMonthAnchor] = useState(startDate ?? minDate ?? new Date());
  const [pickingEnd, setPickingEnd] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPickingEnd(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handlePick(d: Date) {
    if (!pickingEnd) {
      onStartChange(toISO(d));
      if (endDate && isBefore(endDate, d)) onEndChange(toISO(d));
      setPickingEnd(true);
    } else {
      if (isBefore(d, startDate ?? d)) {
        onStartChange(toISO(d));
      } else {
        onEndChange(toISO(d));
        setOpen(false);
        setPickingEnd(false);
      }
    }
  }

  const label =
    startDate && endDate
      ? `${DAY_LABEL.format(startDate)} — ${DAY_LABEL.format(endDate)}`
      : startDate
        ? `${DAY_LABEL.format(startDate)} — Select check-out`
        : `${startLabel} — ${endLabel}`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {startName && <input type="hidden" name={startName} value={startValue} required={required} />}
      {endName && <input type="hidden" name={endName} value={endValue} required={required} />}
      <button
        type="button"
        onClick={() => {
          setMonthAnchor(startDate ?? minDate ?? new Date());
          setPickingEnd(!!startDate && !endDate);
          setOpen((v) => !v);
        }}
        className={`glass-select ${variant === "subtle" ? "glass-select-subtle" : ""} flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm text-charcoal-900 outline-none transition-all duration-200 ${
          open ? "border-gold-500/70 ring-2 ring-gold-400/30" : "hover:border-gold-400/60"
        }`}
      >
        <span className={startDate ? "" : "text-charcoal-500"}>{label}</span>
        <CalendarDays size={16} className="shrink-0 text-forest-600" />
      </button>

      <AnimatePresence>
        {open && (
          <Popover monthAnchor={monthAnchor} setMonthAnchor={setMonthAnchor} min={minDate}>
            {(grid) => (
              <>
                <p className="mb-2 mt-1 text-center text-[11px] font-medium text-gold-700">
                  {pickingEnd ? `Select ${endLabel.toLowerCase()}` : `Select ${startLabel.toLowerCase()}`}
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {grid.map((date, i) => {
                    if (!date) return <span key={i} />;
                    const disabled = !!minDate && isBefore(date, minDate);
                    const inRange = !!startDate && !!endDate && date > startDate && date < endDate;
                    const selected = isSameDay(date, startDate) || isSameDay(date, endDate);
                    return (
                      <DayCell
                        key={i}
                        date={date}
                        disabled={disabled}
                        selected={selected}
                        inRange={inRange}
                        isToday={isSameDay(date, today)}
                        onClick={() => handlePick(date)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </Popover>
        )}
      </AnimatePresence>
    </div>
  );
}
