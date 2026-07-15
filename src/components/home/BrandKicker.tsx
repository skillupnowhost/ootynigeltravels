"use client";

import { motion } from "motion/react";

const WORDS = ["OOTY", "NIGEL", "TRAVELS"];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const word = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export function BrandKicker({ isNight }: { isNight: boolean }) {
  return (
    <motion.div
      className="inline-flex items-start"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={container}
    >
      <p className="inline-flex items-baseline gap-x-2 whitespace-nowrap font-display font-semibold uppercase leading-none tracking-[0.08em] sm:gap-x-2.5 sm:tracking-[0.1em]">
        {WORDS.map((w) => (
          <motion.span
            key={w}
            variants={word}
            className="shimmer-text animate-shimmer inline-block whitespace-nowrap text-2xl sm:text-3xl md:text-4xl"
          >
            {w}
          </motion.span>
        ))}
      </p>
    </motion.div>
  );
}
