"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { TriangleAlert } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const STEAM_PUFFS = [
  { left: "16%", delay: 0 },
  { left: "22%", delay: 0.5 },
  { left: "12%", delay: 1 },
];

const DEBRIS = [
  { left: "30%", bottom: "14%", size: 5, delay: 0.55 },
  { left: "38%", bottom: "10%", size: 4, delay: 0.7 },
  { left: "46%", bottom: "16%", size: 3, delay: 0.85 },
];

/**
 * A realistic car (real transparent-PNG artwork, matching the hero sections
 * elsewhere on the site) that has just clipped a bent "404" milepost —
 * skid marks, a hazard triangle, hood steam and scattered debris tell the
 * story around it without anything graphic.
 */
export function CrashCarScene({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] ${className}`}>
      {/* road */}
      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/30 to-transparent" />

      {/* impact dust glow */}
      <motion.div
        className="absolute bottom-[16%] left-[38%] h-14 w-1/2 -translate-x-1/2 rounded-full bg-gold-400/25 blur-2xl"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 0.9, ease }}
      />

      {/* skid marks */}
      <svg viewBox="0 0 400 120" className="absolute inset-x-0 bottom-[8%] h-[26%] w-full" preserveAspectRatio="none">
        <motion.path
          d="M20 100 C 90 90, 150 68, 225 40"
          stroke="#59584f"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
        />
        <motion.path
          d="M38 112 C 105 104, 160 82, 235 52"
          stroke="#59584f"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
        />
      </svg>

      {/* bent 404 signpost, struck and leaning */}
      <motion.div
        className="absolute bottom-[24%] left-[6%] origin-bottom sm:left-[10%]"
        initial={{ rotate: 0 }}
        animate={{ rotate: 10 }}
        transition={{ duration: 0.7, ease, delay: 0.15 }}
      >
        <svg viewBox="0 0 70 120" className="h-20 w-auto sm:h-28">
          <path d="M34 120 C 36 80 38 50 42 20" stroke="#3a4a42" strokeWidth="5" strokeLinecap="round" fill="none" />
          <g transform="translate(42 18) rotate(-8)">
            <rect x="-32" y="-20" width="66" height="36" rx="6" fill="#123f31" stroke="#c8a15c" strokeWidth="2" />
            <text
              x="1"
              y="5"
              textAnchor="middle"
              fontSize="17"
              fontWeight="700"
              fill="#fbf8f2"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              404
            </text>
          </g>
        </svg>
      </motion.div>

      {/* hazard triangle */}
      <motion.div
        className="absolute bottom-[34%] left-[2%] sm:left-[5%]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: [1, 1.08, 1] }}
        transition={{
          opacity: { duration: 0.4, delay: 0.5 },
          scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
        }}
      >
        <TriangleAlert className="h-7 w-7 fill-forest-900 text-gold-400 sm:h-9 sm:w-9" strokeWidth={2} />
      </motion.div>

      {/* the car — centering transform lives on this plain div; Motion owns
          the transform on the nested elements below, and the two can't
          share one element without Motion silently clobbering the
          Tailwind translate-x-1/2 with its own inline transform. */}
      <div className="absolute bottom-[4%] left-1/2 w-[58%] -translate-x-1/2 sm:w-[46%]">
        <motion.div
          initial={{ x: 28, rotate: 0, opacity: 0 }}
          animate={{ x: 0, rotate: -6, opacity: 1 }}
          transition={{ duration: 0.6, ease, delay: 0.05 }}
        >
          <motion.div
            animate={{ rotate: [-0.6, 0.6, -0.6] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute -bottom-1 left-1/2 h-3 w-[62%] -translate-x-1/2 rounded-full bg-charcoal-900/50 blur-sm" />
            <Image
              src="/images/scenes/car-left.png"
              alt="Illustration of a car that has taken a wrong turn and clipped a 404 signpost"
              width={4025}
              height={1615}
              className="relative w-full drop-shadow-[0_18px_26px_rgba(7,31,24,0.55)]"
            />

            {STEAM_PUFFS.map((puff, i) => (
              <motion.div
                key={i}
                className="absolute top-[10%] h-5 w-5 rounded-full bg-ivory-50 blur-[3px] sm:h-6 sm:w-6"
                style={{ left: puff.left }}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: [0, 0.6, 0], y: -30, scale: 1.4 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: puff.delay }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* scattered debris */}
      {DEBRIS.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold-200/80"
          style={{ left: d.left, bottom: d.bottom, width: d.size, height: d.size }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 0.4, ease, delay: d.delay }}
        />
      ))}
    </div>
  );
}
