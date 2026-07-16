"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Cog, Wrench } from "lucide-react";

const SPARKS = [
  { x: -3, y: -3, delay: 0 },
  { x: 4, y: -5, delay: 0.25 },
  { x: -1, y: -6, delay: 0.5 },
];

/**
 * A realistic car (real transparent-PNG artwork, matching the hero sections
 * elsewhere on the site) raised on a striped service lift with a wrench
 * working the front wheel and a spinning upgrade gear alongside — a calm,
 * reassuring "under the hood" scene for maintenance downtime.
 */
export function MaintenanceCarScene({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] ${className}`}>
      {/* workshop floor */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-forest-100" />
      <svg className="absolute inset-x-0 bottom-0 h-[30%] w-full opacity-60" preserveAspectRatio="none" viewBox="0 0 400 90">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={i * 46 - 20} y1="0" x2={i * 46 - 60} y2="90" stroke="#cfe3da" strokeWidth="2" />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-[30%] h-[3px] bg-forest-800/20" />

      {/* caution-striped lift platform */}
      <div className="absolute bottom-[26%] left-1/2 h-[6%] w-[70%] -translate-x-1/2 overflow-hidden rounded-sm">
        <div className="absolute inset-0 bg-forest-800" />
        <motion.div
          className="absolute inset-y-0 w-[220%]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #d2b174 0, #d2b174 10px, #123f31 10px, #123f31 20px)",
          }}
          initial={{ x: "-10%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {/* lift posts */}
      <div className="absolute bottom-[26%] left-[22%] h-[8%] w-[3%] rounded-sm bg-charcoal-500" />
      <div className="absolute bottom-[26%] right-[22%] h-[8%] w-[3%] rounded-sm bg-charcoal-500" />

      {/* spinning upgrade gear */}
      <motion.div
        className="absolute left-[6%] top-[18%] sm:left-[9%]"
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <Cog className="h-8 w-8 text-forest-700 sm:h-11 sm:w-11" strokeWidth={1.75} />
      </motion.div>

      {/* the car, lifted — centering transform lives on this plain div;
          Motion owns the transform on the nested motion.div, since the two
          can't share one element without Motion clobbering the Tailwind
          translate-x-1/2 with its own inline transform. */}
      <div className="absolute bottom-[31%] left-1/2 w-[56%] -translate-x-1/2 sm:w-[46%]">
        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
          <div className="absolute -bottom-1 left-1/2 h-3 w-[62%] -translate-x-1/2 rounded-full bg-charcoal-900/25 blur-sm" />
          <Image
            src="/images/scenes/car-right.png"
            alt="Illustration of a car raised on a service lift being tuned up"
            width={2000}
            height={901}
            className="relative w-full drop-shadow-[0_16px_24px_rgba(23,24,26,0.25)]"
          />
        </motion.div>
      </div>

      {/* rotating wrench working the front wheel */}
      <motion.div
        className="absolute bottom-[30%] right-[10%] sm:right-[14%]"
        animate={{ rotate: [0, -28, 6, -28, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 100%" }}
      >
        <Wrench className="h-7 w-7 text-gold-700 sm:h-9 sm:w-9" strokeWidth={2} />
      </motion.div>

      {/* sparks at the hub */}
      <div className="absolute bottom-[31%] right-[9%] sm:right-[13%]">
        {SPARKS.map((s, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-gold-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], x: [0, s.x * 4], y: [0, s.y * 4] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeOut", delay: s.delay }}
          />
        ))}
      </div>
    </div>
  );
}
