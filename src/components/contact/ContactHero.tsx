"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Phone } from "lucide-react";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { WhatsAppGlyphIcon } from "@/components/ui/BrandIcons";
import { site, waLink } from "@/lib/config/site";

const ease = [0.22, 1, 0.36, 1] as const;

const FAR_PEAKS =
  "M0,560 L120,430 L255,505 L420,385 L610,485 L800,405 L1000,470 L1210,415 L1440,500 L1440,900 L0,900 Z";
const MID_HILLS =
  "M0,625 L165,520 L340,595 L520,500 L705,600 L905,510 L1125,610 L1305,540 L1440,600 L1440,900 L0,900 Z";

const CLOUDS = [
  { cx: 220, cy: 140, rx: 140, ry: 24, dur: 46, delay: 0, op: 0.55 },
  { cx: 720, cy: 95, rx: 180, ry: 28, dur: 62, delay: -8, op: 0.45 },
  { cx: 1080, cy: 210, rx: 120, ry: 20, dur: 38, delay: -20, op: 0.4 },
  { cx: 430, cy: 250, rx: 160, ry: 22, dur: 54, delay: -30, op: 0.32 },
];

const BIRDS = [
  { x0: -40, y: 160, scale: 1, dur: 26, delay: 0 },
  { x0: -90, y: 190, scale: 0.75, dur: 26, delay: 1.4 },
  { x0: -60, y: 210, scale: 0.6, dur: 26, delay: 2.6 },
];

function Bird({ delay = 0 }: { delay?: number }) {
  return (
    <motion.path
      d="M-6 0 C-3 -4 -1 -4 0 0 C1 -4 3 -4 6 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
      animate={{ d: ["M-6 0 C-3 -4 -1 -4 0 0 C1 -4 3 -4 6 0", "M-6 0 C-3 2 -1 2 0 0 C1 2 3 2 6 0", "M-6 0 C-3 -4 -1 -4 0 0 C1 -4 3 -4 6 0"] }}
      transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

export function ContactHero() {
  return (
    <section className="relative flex min-h-[92svh] w-full items-center overflow-hidden bg-forest-950 pt-28 pb-20 text-ivory-50 sm:min-h-[88svh]">
      {/* Scenic backdrop */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="contact-hero-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b3b2e" />
              <stop offset="45%" stopColor="#123f31" />
              <stop offset="100%" stopColor="#071f18" />
            </linearGradient>
            <radialGradient id="contact-hero-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dcc08b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#dcc08b" stopOpacity="0" />
            </radialGradient>
            <filter id="contact-hero-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>

          <rect width="1440" height="900" fill="url(#contact-hero-sky)" />
          <circle cx="1180" cy="175" r="150" fill="url(#contact-hero-glow)" filter="url(#contact-hero-blur)" />

          {CLOUDS.map((c, i) => (
            <motion.ellipse
              key={i}
              cx={c.cx}
              cy={c.cy}
              rx={c.rx}
              ry={c.ry}
              fill="#fbf8f2"
              opacity={c.op}
              filter="url(#contact-hero-blur)"
              initial={{ x: 0 }}
              animate={{ x: [0, 120, 0, -120, 0] }}
              transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          <path d={FAR_PEAKS} fill="#cfe3da" opacity="0.22" />
          <path d={MID_HILLS} fill="#2f8a6e" opacity="0.3" />
          {Array.from({ length: 6 }).map((_, i) => (
            <path
              key={i}
              d={`M-20 ${640 - i * 13} Q720 ${600 - i * 13} 1460 ${640 - i * 13}`}
              stroke="#1b5744"
              strokeWidth="6"
              fill="none"
              opacity={0.14 + i * 0.03}
            />
          ))}

          <g className="text-gold-200/70">
            {BIRDS.map((b, i) => (
              <motion.g
                key={i}
                initial={{ x: b.x0 }}
                animate={{ x: 1500 }}
                transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "linear" }}
                style={{ transformBox: "fill-box" }}
              >
                <g transform={`translate(0 ${b.y}) scale(${b.scale})`}>
                  <Bird delay={b.delay} />
                </g>
              </motion.g>
            ))}
          </g>

          <motion.ellipse
            cx="260"
            cy="740"
            rx="180"
            ry="22"
            fill="#fbf8f2"
            opacity="0.28"
            filter="url(#contact-hero-blur)"
            className="animate-mist-drift"
          />
          <motion.ellipse
            cx="1020"
            cy="750"
            rx="220"
            ry="24"
            fill="#fbf8f2"
            opacity="0.24"
            filter="url(#contact-hero-blur)"
            className="animate-mist-drift"
            style={{ animationDelay: "3s" }}
          />

          <rect x="0" y="780" width="1440" height="120" fill="#071f18" opacity="0.92" />
        </svg>

        {/* Luxury vehicle cruising along the base of the scene */}
        <motion.div
          className="absolute bottom-[6%] w-[220px] sm:bottom-[7%] sm:w-[280px] lg:w-[340px]"
          initial={{ left: "-30%", opacity: 0 }}
          animate={{ left: ["-30%", "115%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear", times: [0, 1] }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute -bottom-1 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-full bg-black/40 blur-sm" />
            <Image
              src="/images/hero/car-hero-2.png"
              alt=""
              width={480}
              height={480}
              className="relative w-full scale-x-[-1] drop-shadow-[0_16px_20px_rgba(0,0,0,0.45)]"
            />
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/20" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forest-950/60 via-transparent to-forest-950/40" />
      </div>

      {/* Content */}
      <div className="container-luxe relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400"
        >
          <span className="h-px w-8 bg-gold-500" aria-hidden />
          Get in touch
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          className="mt-5 max-w-3xl font-display text-4xl leading-[1.08] text-ivory-50 sm:text-5xl md:text-6xl"
        >
          Let&rsquo;s Plan Your Perfect{" "}
          <span className="shimmer-text">Ooty Journey</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease }}
          className="mt-6 max-w-xl text-base leading-relaxed text-forest-200 sm:text-lg"
        >
          Our Nilgiris travel experts are on call every day of the year — from a two-day
          Ooty escape to a fully curated multi-city honeymoon, tell us what you have in
          mind and we&rsquo;ll shape it around you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.26, ease }}
          className="mt-9 flex flex-wrap gap-3 sm:gap-4"
        >
          <Link
            href="/booking"
            className="group relative inline-flex items-center gap-2 rounded-full bg-gold-600 px-6 py-3.5 text-sm font-semibold text-forest-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-700 hover:shadow-[0_16px_36px_-10px_rgba(200,161,92,0.65)]"
          >
            Book Now
          </Link>
          <a
            href="#channels"
            className="group inline-flex items-center gap-2 rounded-full border border-ivory-50/30 bg-ivory-50/[0.06] px-6 py-3.5 text-sm font-semibold text-ivory-50 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/70 hover:bg-ivory-50/10"
          >
            Contact Us
          </a>
          <a
            href={waLink(`Hello ${site.name}, I'd like to plan my Ooty journey.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-10px_rgba(37,211,102,0.6)]"
          >
            <MotionIcon preset="pulse" loop>
              <WhatsAppGlyphIcon size={17} />
            </MotionIcon>
            WhatsApp
          </a>
          <a
            href={site.phoneHref}
            className="group inline-flex items-center gap-2 rounded-full border border-gold-400/50 px-6 py-3.5 text-sm font-semibold text-gold-200 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-400/10"
          >
            <MotionIcon preset="ring" loop>
              <Phone size={16} />
            </MotionIcon>
            Call Now
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-forest-300"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" /> {site.hours}
          </span>
          <span>{site.phone} · {site.altPhone}</span>
          <span>{site.address}</span>
        </motion.div>
      </div>
    </section>
  );
}
