"use client";

import { motion } from "motion/react";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { InstagramIcon, FacebookIcon, YoutubeIcon, TelegramIcon } from "@/components/ui/BrandIcons";
import { CarDriveIcon, MapPinDropIcon, CalendarCheckIcon, HeadsetPulseIcon } from "@/components/ui/AnimatedIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { site } from "@/lib/config/site";

const FEATURES = [
  { icon: <CarDriveIcon size={19} />, label: "Private, Chauffeur-Driven Rides" },
  { icon: <MapPinDropIcon size={19} />, label: "Genuinely Local, Ooty-Based" },
  { icon: <CalendarCheckIcon size={19} />, label: "Itineraries Built Around You" },
  { icon: <HeadsetPulseIcon size={19} />, label: "Round-the-Clock Support" },
];

const SOCIALS = [
  { href: site.social.instagram, icon: <InstagramIcon size={17} />, label: "Instagram" },
  { href: site.social.facebook, icon: <FacebookIcon size={17} />, label: "Facebook" },
  { href: site.social.youtube, icon: <YoutubeIcon size={17} />, label: "YouTube" },
  { href: site.social.telegram, icon: <TelegramIcon size={17} />, label: "Telegram" },
];

export function BusinessInfoStrip() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-forest-100 bg-white/80 p-7 backdrop-blur-md sm:p-9">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-3.5 py-1.5 text-xs font-semibold text-forest-700">
            <MapPinDropIcon size={14} className="text-gold-600" />
            Based in Ooty, The Nilgiris
          </span>
          <p className="mt-4 max-w-sm font-display text-2xl leading-snug text-forest-950">
            Here whenever you need us — every day, all year.
          </p>
        </div>

        <RevealGroup className="grid grid-cols-2 gap-x-8 gap-y-6 lg:flex lg:flex-1 lg:justify-end lg:gap-10" stagger={0.07}>
          {FEATURES.map((f) => (
            <RevealItem key={f.label} className="flex max-w-[11rem] items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900 text-gold-400">
                {f.icon}
              </span>
              <p className="text-xs leading-snug text-charcoal-600">{f.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <div className="mt-8 flex items-center gap-3 border-t border-forest-100 pt-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">Follow along</span>
        <div className="flex items-center gap-2.5">
          {SOCIALS.map((s) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-200 text-forest-700 transition-colors duration-300 hover:border-gold-400 hover:text-gold-700"
            >
              <MotionIcon preset="orbit">{s.icon}</MotionIcon>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
