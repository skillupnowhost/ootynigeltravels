"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

export interface GlassSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface GlassSelectProps {
  name?: string;
  options: GlassSelectOption[];
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

/** Glassmorphism drop-in replacement for a native <select>. Always renders a
 * hidden <input name=...> so it works inside plain <form action/method> submits
 * (server actions and GET filter forms alike) exactly like the element it replaces. */
export function GlassSelect({
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Select...",
  disabled = false,
  required = false,
  className = "",
  size = "md",
  variant = "default",
}: GlassSelectProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = isControlled ? value : internal;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === current))
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === current);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function commit(next: string) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setActiveIndex(Math.max(0, options.findIndex((o) => o.value === current)));
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => nextEnabledIndex(options, i, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => nextEnabledIndex(options, i, -1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(nextEnabledIndex(options, -1, 1));
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(nextEnabledIndex(options, options.length, -1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt && !opt.disabled) commit(opt.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  const sizeClasses = size === "sm" ? "px-3.5 py-2 text-sm" : "px-4 py-3 text-sm";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={current} required={required} />}
      <button
        type="button"
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={`glass-select ${variant === "subtle" ? "glass-select-subtle" : ""} flex w-full items-center justify-between gap-2 rounded-xl text-left text-charcoal-900 outline-none transition-all duration-200 ${sizeClasses} ${
          open ? "border-gold-500/70 ring-2 ring-gold-400/30" : ""
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-gold-400/60"}`}
      >
        <span className={selected ? "" : "text-charcoal-500"}>{selected ? selected.label : placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 text-forest-600"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

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
            {options.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === current}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => !opt.disabled && commit(opt.value)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ${
                  opt.disabled
                    ? "cursor-not-allowed text-charcoal-500/50"
                    : i === activeIndex
                      ? "bg-gold-100/70 text-forest-950"
                      : "text-charcoal-900 hover:bg-forest-50"
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

function nextEnabledIndex(options: GlassSelectOption[], from: number, dir: 1 | -1) {
  const n = options.length;
  for (let step = 1; step <= n; step++) {
    const idx = (from + dir * step + n) % n;
    if (!options[idx]?.disabled) return idx;
  }
  return Math.max(0, from);
}
