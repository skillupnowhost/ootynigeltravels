"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { WhatsAppGlyphIcon } from "@/components/ui/BrandIcons";
import { ShieldBadgeIcon, HeadsetPulseIcon, CalendarCheckIcon } from "@/components/ui/AnimatedIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { site, waLink } from "@/lib/config/site";

const TRUST_BADGES = [
  { icon: <ShieldBadgeIcon size={16} loop={false} />, label: "Trusted local experts" },
  { icon: <HeadsetPulseIcon size={16} loop={false} />, label: "24 × 7 support" },
  { icon: <CalendarCheckIcon size={16} loop={false} />, label: "Itineraries built around you" },
];

export function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-forest-950 py-20 text-ivory-50">
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 animate-glow-pulse opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(200,161,92,0.35), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-full w-1/2 animate-glow-pulse opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(47,138,110,0.4), transparent 70%)", animationDelay: "1.2s" }}
        aria-hidden
      />

      <div className="container-luxe relative flex flex-col items-center gap-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl"
        >
          Ready to Explore <span className="shimmer-text">Ooty?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-base text-forest-200 sm:text-lg"
        >
          Every itinerary is built around you — no templates, no rush. Let&rsquo;s start
          planning your journey through the Nilgiris today.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/booking"
            className="group inline-flex items-center gap-2 rounded-full bg-gold-600 px-8 py-4 text-sm font-semibold text-forest-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-700 hover:shadow-[0_18px_40px_-12px_rgba(200,161,92,0.65)]"
          >
            Book Your Journey
          </Link>
          <a
            href={waLink(`Hello ${site.name}, I'm ready to plan my Ooty trip.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-[#25D366]/50 bg-[#25D366]/10 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#25D366]"
          >
            <MotionIcon preset="pulse" loop>
              <WhatsAppGlyphIcon size={17} />
            </MotionIcon>
            Chat on WhatsApp
          </a>
        </motion.div>

        <RevealGroup className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-ivory-50/10 pt-8" stagger={0.08}>
          {TRUST_BADGES.map((b) => (
            <RevealItem key={b.label} className="flex items-center gap-2 text-xs font-medium text-forest-300">
              <span className="text-gold-400">{b.icon}</span>
              {b.label}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
