"use client";

import { motion } from "motion/react";
import { Counter } from "@/components/ui/Counter";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { InstagramIcon, FacebookIcon, YoutubeIcon, TelegramIcon } from "@/components/ui/BrandIcons";
import { ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { site } from "@/lib/config/site";

const STATS = [
  { value: site.stats.yearsExperience, suffix: "+", label: "Years of Experience" },
  { value: site.stats.happyTravellers, suffix: "+", label: "Happy Travellers" },
  { value: site.stats.toursCompleted, suffix: "+", label: "Tours Completed" },
  { value: site.stats.fleetSize, suffix: "", label: "Vehicles in Fleet" },
];

const SOCIALS = [
  { href: site.social.instagram, icon: <InstagramIcon size={18} />, label: "Instagram" },
  { href: site.social.facebook, icon: <FacebookIcon size={18} />, label: "Facebook" },
  { href: site.social.youtube, icon: <YoutubeIcon size={18} />, label: "YouTube" },
  { href: site.social.telegram, icon: <TelegramIcon size={18} />, label: "Telegram" },
];

export function BusinessInfoStrip() {
  return (
    <div className="overflow-hidden rounded-3xl border border-forest-800 bg-forest-950 text-ivory-50">
      <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <RevealGroup className="grid grid-cols-2 gap-6 sm:grid-cols-4" stagger={0.08}>
          {STATS.map((s) => (
            <RevealItem key={s.label} className="text-center lg:text-left">
              <Counter value={s.value} suffix={s.suffix} className="font-display text-3xl text-gold-400 sm:text-4xl" />
              <p className="mt-1 text-xs text-forest-300">{s.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="flex flex-col items-center gap-4 border-t border-forest-800 pt-8 lg:items-end lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest-900/60 px-3.5 py-1.5 text-xs font-semibold text-gold-300">
            <ShieldBadgeIcon size={14} className="text-gold-400" />
            Licensed &amp; verified travel operator
          </span>
          <div className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-forest-700 text-forest-200 transition-colors duration-300 hover:border-gold-400 hover:text-gold-300"
              >
                <span
                  className="pointer-events-none absolute inset-0 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-70"
                  style={{ background: "radial-gradient(circle, rgba(220,192,139,0.55), transparent 70%)" }}
                  aria-hidden
                />
                <MotionIcon preset="orbit">{s.icon}</MotionIcon>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
