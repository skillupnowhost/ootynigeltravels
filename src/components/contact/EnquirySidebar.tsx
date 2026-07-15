"use client";

import { motion } from "motion/react";
import { MapPinDropIcon, CompassIcon, ShieldBadgeIcon, ClockHandsIcon } from "@/components/ui/AnimatedIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { WhatsAppGlyphIcon } from "@/components/ui/BrandIcons";
import { site, waLink } from "@/lib/config/site";

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { icon: <MapPinDropIcon size={17} loop={false} />, title: "Destination & dates", copy: "Where you're headed and when." },
  { icon: <CompassIcon size={17} loop={false} />, title: "Preferences", copy: "Vehicle, stay category, budget." },
  { icon: <ShieldBadgeIcon size={17} loop={false} />, title: "Your details", copy: "So we can reach you with a plan." },
];

const BADGES = [
  { icon: <ShieldBadgeIcon size={15} loop={false} />, label: "No payment required" },
  { icon: <ClockHandsIcon size={15} loop={false} />, label: "Replies within hours" },
];

export function EnquirySidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease }}
      className="overflow-hidden rounded-[1.75rem] border border-forest-800 bg-forest-950 p-7 text-ivory-50 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Three quick steps</p>
      <p className="mt-2 font-display text-xl leading-snug text-ivory-50">
        Tell us once, we&rsquo;ll shape a plan around it.
      </p>

      <RevealGroup className="mt-7 space-y-5" stagger={0.08}>
        {STEPS.map((step, i) => (
          <RevealItem key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-600 text-forest-950">
                {step.icon}
              </span>
              {i < STEPS.length - 1 && <span className="mt-1 w-px flex-1 bg-forest-700" aria-hidden />}
            </div>
            <div className="pb-1">
              <p className="text-sm font-semibold text-ivory-50">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-forest-300">{step.copy}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <div className="mt-7 flex flex-wrap gap-2 border-t border-forest-800 pt-6">
        {BADGES.map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest-900/70 px-3 py-1.5 text-[11px] font-medium text-forest-200"
          >
            <span className="text-gold-400">{b.icon}</span>
            {b.label}
          </span>
        ))}
      </div>

      <a
        href={waLink(`Hello ${site.name}, I'd like to skip the form and chat directly.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-forest-200 underline decoration-forest-600 underline-offset-4 hover:text-gold-300"
      >
        <WhatsAppGlyphIcon size={14} />
        Prefer to skip the form? Message us on WhatsApp
      </a>
    </motion.div>
  );
}
