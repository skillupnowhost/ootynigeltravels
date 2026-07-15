"use client";

import { motion, type TargetAndTransition } from "motion/react";
import type { ReactNode } from "react";

type Preset = "bounce" | "spin" | "wiggle" | "pulse" | "pop" | "ring" | "tilt" | "orbit";

const PRESETS: Record<Preset, { hover: TargetAndTransition; loop?: TargetAndTransition }> = {
  bounce: { hover: { y: [0, -4, 0], transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } },
  spin: { hover: { rotate: 360, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } },
  wiggle: { hover: { rotate: [0, -12, 10, -6, 0], transition: { duration: 0.55 } } },
  pop: { hover: { scale: [1, 1.22, 1], transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } },
  ring: { hover: { rotate: [0, -18, 16, -10, 6, 0], transition: { duration: 0.6 } } },
  tilt: { hover: { rotate: 8, y: -2, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } },
  orbit: { hover: { rotate: 360, scale: 1.08, transition: { duration: 0.8, ease: "linear" } } },
  pulse: {
    hover: { scale: [1, 1.15, 1], transition: { duration: 0.5 } },
    loop: {
      scale: [1, 1.12, 1],
      opacity: [1, 0.85, 1],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
    },
  },
};

export function MotionIcon({
  children,
  className,
  preset = "pop",
  loop = false,
}: {
  children: ReactNode;
  className?: string;
  preset?: Preset;
  loop?: boolean;
}) {
  const { hover, loop: loopVariant } = PRESETS[preset];
  return (
    <motion.span
      className={`inline-flex ${className ?? ""}`}
      style={{ display: "inline-flex" }}
      initial={{ rotate: 0, scale: 1, y: 0 }}
      whileHover={hover}
      animate={loop && loopVariant ? loopVariant : undefined}
    >
      {children}
    </motion.span>
  );
}
