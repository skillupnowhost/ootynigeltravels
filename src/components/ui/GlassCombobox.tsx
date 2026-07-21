"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

export interface GlassComboboxOption {
  value: string;
  label: string;
  group?: string;
}

interface GlassComboboxProps {
  name?: string;
  options: GlassComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: "sm" | "md";
  variant?: "default" | "subtle";
}

/**
 * Strict, searchable dropdown — like GlassSelect, but with a text filter so
 * typing "coi" narrows to matching options. Only a value present in
 * `options` can ever be committed (typing a value that matches nothing and
 * blurring away reverts to the last valid selection), so it doubles as
 * client-side validation for allow-listed fields like pickup locations.
 */
export function GlassCombobox({
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Search...",
  disabled = false,
  required = false,
  className = "",
  size = "md",
  variant = "default",
}: GlassComboboxProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = isControlled ? value : internal;
  const selected = options.find((o) => o.value === current);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selected?.label ?? "");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Keep the visible text in sync when the selected value changes from outside
  // (e.g. a parent resets the form) — adjusted during render rather than in an
  // effect, per React's "you might not need an effect" guidance (see Navbar.tsx).
  const [lastSyncedLabel, setLastSyncedLabel] = useState(selected?.label ?? "");
  if ((selected?.label ?? "") !== lastSyncedLabel) {
    setLastSyncedLabel(selected?.label ?? "");
    setQuery(selected?.label ?? "");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === selected?.label.toLowerCase()) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.group?.toLowerCase().includes(q));
  }, [options, query, selected?.label]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selected?.label ?? "");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [selected?.label]);

  function commit(next: GlassComboboxOption) {
    if (!isControlled) setInternal(next.value);
    onChange?.(next.value);
    setQuery(next.label);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) commit(opt);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery(selected?.label ?? "");
    }
  }

  const sizeClasses = size === "sm" ? "px-3.5 py-2 text-sm" : "px-4 py-3 text-sm";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={current} required={required} />}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => {
            // Revert stray text that doesn't match any option — only a listed value ever commits.
            if (!filtered.some((o) => o.label === query)) setQuery(selected?.label ?? "");
          }}
          className={`glass-select ${variant === "subtle" ? "glass-select-subtle" : ""} w-full rounded-xl text-charcoal-900 outline-none transition-all duration-200 ${sizeClasses} ${
            open ? "border-gold-500/70 ring-2 ring-gold-400/30" : ""
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        />
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-600"
        >
          <ChevronDown size={16} />
        </motion.span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass-popover absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 overflow-auto rounded-2xl p-1.5"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2.5 text-sm text-charcoal-500">No matching pickup point</li>
            )}
            {filtered.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === current}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(opt)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ${
                  i === activeIndex ? "bg-gold-100/70 text-forest-950" : "text-charcoal-900 hover:bg-forest-50"
                }`}
              >
                {opt.label}
                {opt.value === current && <Check size={14} className="text-gold-700" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
