"use client";

import { motion } from "motion/react";

export type AnimatedIconProps = {
  size?: number;
  className?: string;
  loop?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** Shield with a checkmark that draws in — trust / safety / years-experience spots. */
export function ShieldBadgeIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      initial="rest"
      whileHover="hover"
      animate={loop ? "hover" : "rest"}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="currentColor"
        opacity={0.08}
        variants={{
          rest: { scale: 0.9, opacity: 0.08 },
          hover: {
            scale: [0.9, 1.12, 0.9],
            opacity: [0.08, 0.18, 0.08],
            transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
          },
        }}
      />
      <path
        d="M12 3.5 19 6.2V11c0 4.6-3 8.2-7 9.5-4-1.3-7-4.9-7-9.5V6.2L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <motion.path
        d="M8.7 12.2 11 14.5l4.6-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15, ease }}
      />
    </motion.svg>
  );
}

/** Trio of twinkling sparkles — luxury / featured / highlight badges. */
export function SparkleBurstIcon({ size = 18, className, loop = true }: AnimatedIconProps) {
  const star = "M0 -6 C0.6 -1.8 1.8 -0.6 6 0 C1.8 0.6 0.6 1.8 0 6 C-0.6 1.8 -1.8 0.6 -6 0 C-1.8 -0.6 -0.6 -1.8 0 -6 Z";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.path
        d={star}
        fill="currentColor"
        transform="translate(12 11)"
        animate={loop ? { scale: [1, 1.25, 1], opacity: [1, 0.7, 1] } : undefined}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d={star}
        fill="currentColor"
        transform="translate(19 6) scale(0.5)"
        animate={loop ? { scale: [0.5, 0.75, 0.5], opacity: [0.6, 1, 0.6] } : undefined}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
      <motion.path
        d={star}
        fill="currentColor"
        transform="translate(5 17) scale(0.4)"
        animate={loop ? { scale: [0.4, 0.6, 0.4], opacity: [0.5, 0.9, 0.5] } : undefined}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
    </svg>
  );
}

/** Compass needle that idles and snaps to attention on hover — exploration / destinations. */
export function CompassIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      whileHover={{ rotate: 20 }}
      transition={{ duration: 0.4, ease }}
    >
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" />
      <motion.g
        animate={loop ? { rotate: [0, 12, -8, 0] } : undefined}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "12px", originY: "12px" }}
      >
        <path d="M14.5 9.5 12 12l2.5 2.5L15.5 8.5Z" fill="currentColor" opacity={0.35} />
        <path d="M9.5 14.5 12 12l-2.5-2.5L8.5 15.5Z" fill="currentColor" />
      </motion.g>
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </motion.svg>
  );
}

/** Mountain silhouette with a sun that rises behind the peak — Nilgiris / scenery. */
export function MountainSunIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <clipPath id="peak-clip">
        <path d="M2 19 9 8l4 5 2-2.5L22 19Z" />
      </clipPath>
      <motion.circle
        cx={15}
        cy={15}
        r={3.2}
        fill="currentColor"
        opacity={0.9}
        clipPath="url(#peak-clip)"
        animate={loop ? { cy: [15, 8.5, 15] } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <path d="M2 19 9 8l4 5 2-2.5L22 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M2 19h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** A single leaf swaying like it's caught in a hill breeze — tea gardens / nature. */
export function LeafSwayIcon({ size = 20, className, loop = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      animate={loop ? { rotate: [-6, 6, -6] } : undefined}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      style={{ originX: "5px", originY: "19px" }}
    >
      <path
        d="M5 19C4 11 9 4 19 3c1 10-6 15-14 16Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.1}
      />
      <path d="M5 19c2-4.5 5.5-8 12-11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </motion.svg>
  );
}

/** Winding ghat road with headlight-style dashes scrolling toward the viewer. */
export function RoadIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 21c-1-6 2-8 2-11S6 4 8 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity={0.25} />
      <path d="M18 21c1-6-2-8-2-11s2-6 0-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity={0.25} />
      <motion.path
        d="M12 21c0-6 0-8 0-11s0-6 0-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="2.4 3.2"
        animate={loop ? { strokeDashoffset: [0, -11.2] } : undefined}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

/** Small chauffeured car with spinning wheels and a gentle suspension bob. */
export function CarDriveIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      animate={loop ? { y: [0, -1.2, 0] } : undefined}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <path
        d="M4 16.5V13l1.8-3.6A2 2 0 0 1 7.6 8.3h8.8a2 2 0 0 1 1.8 1.1L20 13v3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.08}
      />
      <path d="M4 16.5h16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8.3 8.5 5.5h7L17 8.3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <motion.circle
        cx="7.5"
        cy="16.7"
        r="1.7"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        animate={loop ? { rotate: 360 } : undefined}
        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        style={{ originX: "7.5px", originY: "16.7px" }}
      />
      <motion.circle
        cx="16.5"
        cy="16.7"
        r="1.7"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        animate={loop ? { rotate: 360 } : undefined}
        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        style={{ originX: "16.5px", originY: "16.7px" }}
      />
    </motion.svg>
  );
}

/** Calendar with a checkmark that draws itself in — booking confirmation moments. */
export function CalendarCheckIcon({ size = 20, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <motion.path
        d="M8.3 14.2 11 16.8l5-5.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={loop ? { pathLength: [0, 1, 1, 0] } : { pathLength: 1 }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.35, 0.85, 1], ease }}
      />
    </svg>
  );
}

/** Glowing five-point star for ratings and testimonials. */
export function GlowStarIcon({ size = 18, className, loop = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
      transition={{ duration: 0.5 }}
    >
      <motion.path
        d="M12 2.5l2.9 6.2 6.6.7-4.9 4.6 1.3 6.6L12 17.6l-5.9 3 1.3-6.6-4.9-4.6 6.6-.7L12 2.5Z"
        fill="currentColor"
        animate={loop ? { filter: ["brightness(1)", "brightness(1.35)", "brightness(1)"] } : undefined}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/** Headset with pulsing sound-wave arcs — support / chat / 24x7 availability. */
export function HeadsetPulseIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="3" y="13" width="4" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="17" y="13" width="4" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 19v1a3 3 0 0 1-3 3h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[0, 1].map((i) => (
        <motion.circle
          key={i}
          cx="12"
          cy="10.5"
          r="1"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          initial={{ r: 1, opacity: 0.9 }}
          animate={loop ? { r: [1, 9], opacity: [0.7, 0] } : undefined}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: i * 1.1 }}
        />
      ))}
    </svg>
  );
}

/** Heart with a soft double-beat pulse — care / hospitality values. */
export function HeartBeatIcon({ size = 20, className, loop = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      animate={loop ? { scale: [1, 1.12, 1, 1.08, 1] } : undefined}
      transition={{ duration: 1.8, repeat: Infinity, times: [0, 0.2, 0.35, 0.55, 1], ease: "easeInOut" }}
    >
      <path
        d="M12 20.2s-7.6-4.6-9.6-9.4C1 7.3 3 4.3 6.3 4.1c2-.1 3.6 1 5.7 3 2.1-2 3.7-3.1 5.7-3 3.3.2 5.3 3.2 3.9 6.7-2 4.8-9.6 9.4-9.6 9.4Z"
        fill="currentColor"
        fillOpacity={0.12}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/** Tea cup with rising steam — Nilgiri tea-garden motif. */
export function TeaSteamIcon({ size = 20, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 11h13v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 12.5h1.5a2.2 2.2 0 0 1 0 4.4H17" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 21h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {[8, 11, 14].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 8c1 0 1-1.4 0-2s-1-1.4 0-2`}
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
          opacity={0.7}
          animate={loop ? { y: [0, -2.4, 0], opacity: [0.15, 0.75, 0.15] } : undefined}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
        />
      ))}
    </svg>
  );
}

/** Clock with hands that actually turn — 24×7 availability, durations. */
export function ClockHandsIcon({ size = 20, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <motion.line
        x1="12"
        y1="12"
        x2="12"
        y2="7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ originX: "12px", originY: "12px" }}
        animate={loop ? { rotate: 360 } : undefined}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />
      <motion.line
        x1="12"
        y1="12"
        x2="15.5"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ originX: "12px", originY: "12px" }}
        animate={loop ? { rotate: 360 } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

/** Friendly robot face with blinking eyes and a pulsing antenna — AI concierge / chat. */
export function AIAgentIcon({ size = 24, className, loop = true }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      whileHover={{ rotate: [0, -4, 4, 0] }}
      transition={{ duration: 0.5 }}
    >
      <motion.line
        x1="12"
        y1="3.4"
        x2="12"
        y2="5.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <motion.circle
        cx="12"
        cy="2.6"
        r="1.15"
        fill="currentColor"
        animate={loop ? { opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] } : undefined}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <rect x="4" y="5.6" width="16" height="13" rx="4.5" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity={0.06} />
      <motion.g
        animate={loop ? { scaleY: [1, 1, 0.1, 1, 1] } : undefined}
        transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.85, 0.9, 0.95, 1], ease: "easeInOut" }}
        style={{ originX: "8.5px", originY: "12px" }}
      >
        <circle cx="8.5" cy="12" r="1.6" fill="currentColor" />
      </motion.g>
      <motion.g
        animate={loop ? { scaleY: [1, 1, 0.1, 1, 1] } : undefined}
        transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.85, 0.9, 0.95, 1], ease: "easeInOut", delay: 0.05 }}
        style={{ originX: "15.5px", originY: "12px" }}
      >
        <circle cx="15.5" cy="12" r="1.6" fill="currentColor" />
      </motion.g>
      <path d="M9.4 15.6c.8.7 4.4.7 5.2 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.6 10.5v3.4M21.4 10.5v3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.6} />
    </motion.svg>
  );
}

/** Two people orbiting close together — friends / group trips. */
export function FriendsGroupIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.g
        animate={loop ? { x: [-0.6, 0.6, -0.6] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="8.5" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.2 19.5c0-3 2.4-5.3 5.3-5.3s5.3 2.3 5.3 5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={loop ? { x: [0.6, -0.6, 0.6] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <circle cx="15.8" cy="6.8" r="2.4" stroke="currentColor" strokeWidth="1.5" opacity={0.8} />
        <path d="M12.3 13.2c1-.7 2.2-1 3.5-1 2.9 0 5.2 2 5.4 4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.8} />
      </motion.g>
    </svg>
  );
}

/** A small family under one roof — family trips. */
export function FamilyGroupIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.path
        d="M4 20v-6.2L12 8l8 5.8V20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity={0.06}
        initial={{ y: -3, opacity: 0.6 }}
        animate={loop ? { y: [0, -1.5, 0] } : { y: 0, opacity: 1 }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="12" cy="5" r="2" fill="currentColor" opacity={0.9} />
      <circle cx="8" cy="15.2" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="16" cy="15.2" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <motion.circle
        cx="12"
        cy="17.4"
        r="1.1"
        fill="currentColor"
        animate={loop ? { scale: [1, 1.25, 1] } : undefined}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </svg>
  );
}

/** Map pin that drops in and pulses a location ring — destinations / addresses. */
export function MapPinDropIcon({ size = 20, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden overflow="visible">
      <motion.ellipse
        cx="12"
        cy="20.5"
        rx="4"
        ry="1"
        fill="currentColor"
        opacity={0.15}
        animate={loop ? { rx: [4, 5.2, 4], opacity: [0.15, 0.05, 0.15] } : undefined}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.1}
        initial={{ y: -6, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      />
      <circle cx="12" cy="9.5" r="2.3" fill="currentColor" />
    </svg>
  );
}

/** Three-person cluster under a single arc — group tours. */
export function PeopleGroupIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.path
        d="M3 20c0-3.5 2.6-6 6-6s6 2.5 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={loop ? { y: [0, -0.8, 0] } : undefined}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="9" cy="9.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <motion.g
        animate={loop ? { y: [0.6, -0.6, 0.6] } : undefined}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      >
        <circle cx="17" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.4" opacity={0.75} />
        <path d="M13.6 19.4c.3-2.6 2-4.5 4.4-4.5 2.2 0 3.9 1.6 4.3 3.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity={0.75} />
      </motion.g>
    </svg>
  );
}

/** Paw print with toes that settle in one after another — wildlife tours. */
export function PawPrintIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  const toes = [
    { cx: 7, cy: 9.5, r: 1.7 },
    { cx: 12, cy: 7.6, r: 1.9 },
    { cx: 17, cy: 9.5, r: 1.7 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.ellipse
        cx="12"
        cy="16.5"
        rx="5.2"
        ry="4.2"
        fill="currentColor"
        initial={{ scale: 0.85, opacity: 0.75 }}
        animate={loop ? { scale: [0.85, 1, 0.85] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {toes.map((t, i) => (
        <motion.circle
          key={i}
          cx={t.cx}
          cy={t.cy}
          r={t.r}
          fill="currentColor"
          initial={{ opacity: 0.3, scale: 0.6 }}
          animate={loop ? { opacity: [0.3, 1, 0.3], scale: [0.6, 1, 0.6] } : { opacity: 1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
        />
      ))}
    </svg>
  );
}

/** Twin hill peaks with a rising-sun glow — hill-station tours. */
export function HillPeakIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.circle
        cx="17.5"
        cy="7"
        r="2.4"
        fill="currentColor"
        opacity={0.7}
        animate={loop ? { opacity: [0.35, 0.85, 0.35], scale: [1, 1.15, 1] } : undefined}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <path
        d="M2.5 19 9 8.5 12.5 14 15 10.5 21.5 19Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.08}
      />
      <path d="M2 19.4h20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Jewelled crown, gems catching light in turn — luxury tours. */
export function CrownIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 18.5 3 8l5 4 4-6.5L16 12l5-4-1 10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.08}
      />
      <path d="M4 18.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[8, 12, 16].map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={cx === 12 ? 9.5 : 11.5}
          r="1"
          fill="currentColor"
          animate={loop ? { opacity: [0.3, 1, 0.3] } : undefined}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        />
      ))}
    </svg>
  );
}

/** Coin purse with a coin dropping in — budget tours. */
export function WalletIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden overflow="visible">
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.06} />
      <path d="M3 10.5h18" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16.5" cy="14.5" r="1.7" stroke="currentColor" strokeWidth="1.3" />
      <motion.circle
        cx="12"
        cy="3.5"
        r="1.6"
        fill="currentColor"
        initial={{ y: 0, opacity: 1 }}
        animate={loop ? { y: [0, 7.5, 0], opacity: [1, 0, 1] } : undefined}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeIn" }}
      />
    </svg>
  );
}

/** Briefcase with a handle that gives a confident click — corporate tours. */
export function BriefcaseIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.path
        d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={loop ? { y: [0, -0.6, 0] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <rect x="3" y="7.5" width="18" height="11.5" rx="2.2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.06} />
      <path d="M3 13h18" stroke="currentColor" strokeWidth="1.3" opacity={0.6} />
      <rect x="10.3" y="11.6" width="3.4" height="2.8" rx="0.6" fill="currentColor" />
    </svg>
  );
}

/** Backpack with a bouncing strap tag — student trips. */
export function BackpackIcon({ size = 22, className, loop = true }: AnimatedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M8 8.5V6.8a4 4 0 0 1 8 0V8.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5.5" y="8.5" width="13" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity={0.06} />
      <path d="M9 12.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <motion.rect
        x="9.5"
        y="15"
        width="5"
        height="4"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.3"
        animate={loop ? { y: [15, 15.7, 15] } : undefined}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
