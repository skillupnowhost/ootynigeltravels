"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls, type TargetAndTransition } from "motion/react";
import { Phone, Mail } from "lucide-react";
import { WhatsAppGlyphIcon } from "@/components/ui/BrandIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { site, waLink } from "@/lib/config/site";

type Tone = "call" | "whatsapp" | "email";

type ToneStyle = { chip: string; ring: string; border: string; hoverShadow: string };

const LIGHT: Record<Tone, ToneStyle> = {
  call: {
    chip: "bg-forest-50 text-forest-700",
    ring: "border-forest-400",
    border: "border-forest-100",
    hoverShadow: "hover:shadow-[0_18px_38px_-18px_rgba(47,138,110,0.5)]",
  },
  whatsapp: {
    chip: "bg-[#25D366]/10 text-[#189d4d]",
    ring: "border-[#25D366]",
    border: "border-[#25D366]/25",
    hoverShadow: "hover:shadow-[0_18px_38px_-18px_rgba(37,211,102,0.5)]",
  },
  email: {
    chip: "bg-gold-50 text-gold-700",
    ring: "border-gold-500",
    border: "border-gold-200",
    hoverShadow: "hover:shadow-[0_18px_38px_-18px_rgba(200,161,92,0.5)]",
  },
};

const DARK: Record<Tone, ToneStyle> = {
  call: {
    chip: "bg-forest-400/15 text-forest-200",
    ring: "border-forest-300",
    border: "border-ivory-50/15",
    hoverShadow: "hover:shadow-[0_18px_38px_-18px_rgba(47,138,110,0.6)]",
  },
  whatsapp: {
    chip: "bg-[#25D366]/15 text-[#3ddc7a]",
    ring: "border-[#25D366]",
    border: "border-[#25D366]/25",
    hoverShadow: "hover:shadow-[0_18px_38px_-18px_rgba(37,211,102,0.55)]",
  },
  email: {
    chip: "bg-gold-400/15 text-gold-300",
    ring: "border-gold-400",
    border: "border-gold-400/25",
    hoverShadow: "hover:shadow-[0_18px_38px_-18px_rgba(200,161,92,0.55)]",
  },
};

/** One-shot animation fired on click — call rings, WhatsApp pops, email bounces. */
const BURST: Record<Tone, TargetAndTransition> = {
  call: { rotate: [0, -22, 18, -14, 8, 0], transition: { duration: 0.6, ease: "easeInOut" } },
  whatsapp: { scale: [1, 1.25, 0.92, 1.08, 1], transition: { duration: 0.5, ease: "easeInOut" } },
  email: { y: [0, -6, 0], rotate: [0, -6, 6, 0], transition: { duration: 0.5, ease: "easeInOut" } },
};

function ActionPill({
  tone,
  label,
  value,
  href,
  external,
  icon,
  style,
  labelClass,
  valueClass,
  bgClass,
}: {
  tone: Tone;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  icon: ReactNode;
  style: ToneStyle;
  labelClass: string;
  valueClass: string;
  bgClass: string;
}) {
  const controls = useAnimationControls();
  const [pulses, setPulses] = useState<number[]>([]);

  const handleClick = () => {
    controls.start(BURST[tone]);
    const id = Date.now();
    setPulses((p) => [...p, id]);
    window.setTimeout(() => setPulses((p) => p.filter((x) => x !== id)), 700);
  };

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      aria-label={`${label}: ${value}`}
      className={`group flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 shadow-sm outline-none backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:px-5 sm:py-4 ${bgClass} ${style.border} ${style.hoverShadow}`}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11">
        <AnimatePresence>
          {pulses.map((id) => (
            <motion.span
              key={id}
              className={`pointer-events-none absolute inset-0 rounded-full border ${style.ring}`}
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1.7, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        <motion.span
          animate={controls}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 340, damping: 18 }}
          className={`flex h-full w-full items-center justify-center rounded-full ${style.chip}`}
        >
          {icon}
        </motion.span>

        {tone === "whatsapp" && (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#25D366]" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className={`block text-[10px] font-semibold uppercase tracking-wide sm:text-[11px] ${labelClass}`}>{label}</span>
        <span className={`block truncate text-sm font-semibold sm:text-[0.95rem] ${valueClass}`}>{value}</span>
      </span>
    </a>
  );
}

/**
 * Contact section for the homepage hero — three independent floating pills
 * (own border, background and shadow each, not one shared divided card),
 * stacked with a visible gap between them. Full-width, one per row, at
 * every breakpoint: the hero's copy column is hard-capped at `max-w-xl`
 * (576px), which isn't enough room for three columns without truncating a
 * phone number or email address, so stacking is what keeps every value
 * fully readable everywhere. Each pill shows the real phone number /
 * WhatsApp number / email address behind a small tone-tinted icon (no
 * solid colour disc) that animates on click, and gets its own tone-colored
 * glow on hover. `variant` swaps the palette for light (day hero) vs. dark
 * (night hero) backgrounds.
 */
export function HeroContactIcons({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const tones = variant === "dark" ? DARK : LIGHT;
  const isDark = variant === "dark";

  const labelClass = isDark ? "text-forest-300" : "text-charcoal-500";
  const valueClass = isDark ? "text-ivory-50" : "text-forest-950";
  const bgClass = isDark ? "bg-ivory-50/[0.05]" : "bg-white/70";

  return (
    <RevealGroup className={`flex w-full flex-col gap-3 ${className ?? ""}`} stagger={0.08}>
      <RevealItem>
        <ActionPill
          tone="call"
          label="Call Us"
          value={site.phone}
          href={site.phoneHref}
          icon={<Phone size={18} />}
          style={tones.call}
          labelClass={labelClass}
          valueClass={valueClass}
          bgClass={bgClass}
        />
      </RevealItem>
      <RevealItem>
        <ActionPill
          tone="whatsapp"
          label="WhatsApp"
          value={site.phone}
          href={waLink(`Hello ${site.name}, I'd like to plan a trip.`)}
          external
          icon={<WhatsAppGlyphIcon size={18} />}
          style={tones.whatsapp}
          labelClass={labelClass}
          valueClass={valueClass}
          bgClass={bgClass}
        />
      </RevealItem>
      <RevealItem>
        <ActionPill
          tone="email"
          label="Email Us"
          value={site.email}
          href={`mailto:${site.email}`}
          icon={<Mail size={18} />}
          style={tones.email}
          labelClass={labelClass}
          valueClass={valueClass}
          bgClass={bgClass}
        />
      </RevealItem>
    </RevealGroup>
  );
}
