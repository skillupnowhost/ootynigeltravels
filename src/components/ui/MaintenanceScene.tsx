"use client";

import { motion } from "motion/react";

const SPARKS = [
  { x: -4, y: -3, delay: 0 },
  { x: 5, y: -6, delay: 0.2 },
  { x: 0, y: -8, delay: 0.4 },
  { x: -6, y: -7, delay: 0.6 },
];

const GEAR_TEETH = Array.from({ length: 8 }, (_, i) => i * 45);

/**
 * A car raised on a service lift with a wrench, a spinning gear and a
 * shower of sparks at the wheel hub — a friendly "under the hood" scene
 * for maintenance / upgrade downtime.
 *
 * Coordinate notes: the platform top sits at y=210, so the car body (drawn
 * with its wheel-rest line at y=194, wheel radius 16) touches down exactly
 * on it; the jack stand under the removed front wheel is placed to match.
 */
export function MaintenanceScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 300"
      className={className}
      role="img"
      aria-label="Illustration of a car raised on a service lift being repaired and upgraded"
    >
      {/* workshop floor */}
      <rect x="0" y="252" width="480" height="48" fill="#e4eee9" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={i * 44 - 20} y1="252" x2={i * 44 - 60} y2="300" stroke="#cfe3da" strokeWidth="2" />
      ))}
      <rect x="0" y="252" width="480" height="4" fill="#123f31" opacity="0.25" />

      {/* lift posts, floor to platform */}
      <rect x="160" y="220" width="10" height="34" rx="3" fill="#59584f" />
      <rect x="310" y="220" width="10" height="34" rx="3" fill="#59584f" />

      {/* caution-striped lift platform */}
      <defs>
        <clipPath id="lift-clip">
          <rect x="150" y="210" width="180" height="10" />
        </clipPath>
        <pattern id="caution-pattern" width="16" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="16" height="10" fill="#d2b174" />
          <rect width="8" height="10" fill="#123f31" />
        </pattern>
      </defs>
      <g clipPath="url(#lift-clip)">
        <rect x="150" y="210" width="180" height="10" fill="#123f31" />
        <motion.rect
          y="210"
          width="360"
          height="10"
          fill="url(#caution-pattern)"
          initial={{ x: -30 }}
          animate={{ x: 150 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      </g>

      {/* car body, lifted */}
      <motion.g
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* rear wheel, resting on the platform */}
        <circle cx="212" cy="194" r="16" fill="#fbf8f2" stroke="#123f31" strokeWidth="2.5" />
        <circle cx="212" cy="194" r="5" fill="#123f31" opacity="0.6" />

        {/* body */}
        <path
          d="M198 182 L206 156 C 210 146, 220 140, 232 140 L268 140 C 280 140, 292 146, 300 156 L322 170 L322 184 L198 184 Z"
          fill="#fbf8f2"
          stroke="#123f31"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M198 184 L322 184 L322 194 L198 194 Z" fill="#e4eee9" stroke="#123f31" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M234 144 L262 144 L272 162 L226 162 Z" fill="#cfe3da" opacity="0.9" />
        <rect x="204" y="186" width="14" height="4" rx="1.5" fill="#d2b174" />

        {/* front wheel removed; jack stand holds the axle */}
        <g transform="translate(316 196)">
          <path d="M-15 14 L0 -12 L15 14 Z" fill="none" stroke="#59584f" strokeWidth="3" strokeLinejoin="round" />
          <rect x="-17" y="12" width="34" height="5" rx="2" fill="#59584f" />
        </g>
      </motion.g>

      {/* rotating wrench working the front hub */}
      <motion.g
        style={{ originX: "316px", originY: "196px" }}
        animate={{ rotate: [0, -34, 8, -34, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <g transform="translate(316 196)">
          <path
            d="M-4 -22 C -10 -22 -14 -18 -14 -12 C -14 -8 -12 -5 -9 -3 L-2 4 L2 0 L-5 -7 C -3 -9 -2 -11 -2 -12 C -2 -18 -6 -22 -4 -22 Z"
            fill="#c8a15c"
            stroke="#123f31"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <rect x="-3" y="0" width="6" height="26" rx="2.5" fill="#c8a15c" stroke="#123f31" strokeWidth="1.6" transform="rotate(35)" />
        </g>
      </motion.g>

      {/* sparks at the hub */}
      <g transform="translate(316 198)">
        {SPARKS.map((s, i) => (
          <motion.circle
            key={i}
            cx={0}
            cy={0}
            r="2"
            fill="#d2b174"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], x: [0, s.x * 3], y: [0, s.y * 3] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeOut", delay: s.delay }}
          />
        ))}
      </g>

      {/* bobbing screwdriver near the hood */}
      <motion.g
        style={{ originX: "252px", originY: "108px" }}
        animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="248" y="90" width="8" height="26" rx="2.5" fill="#a67c34" transform="rotate(-20 252 103)" />
        <rect x="244" y="110" width="16" height="7" rx="2" fill="#2c2d2b" transform="rotate(-20 252 113)" />
      </motion.g>

      {/* spinning upgrade gear */}
      <motion.g
        transform="translate(100 110)"
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <circle r="20" fill="none" stroke="#123f31" strokeWidth="4" />
        <circle r="7" fill="#123f31" />
        {GEAR_TEETH.map((angle) => (
          <rect key={angle} x="-3.5" y="-26" width="7" height="10" rx="1.5" fill="#123f31" transform={`rotate(${angle})`} />
        ))}
      </motion.g>

      {/* indeterminate progress indicator */}
      <defs>
        <clipPath id="progress-clip">
          <rect x="0" y="0" width="320" height="8" rx="4" />
        </clipPath>
      </defs>
      <g transform="translate(80 280)">
        <rect x="0" y="0" width="320" height="8" rx="4" fill="#cfe3da" />
        <g clipPath="url(#progress-clip)">
          <motion.rect
            y="0"
            width="90"
            height="8"
            rx="4"
            fill="#c8a15c"
            initial={{ x: -90 }}
            animate={{ x: 320 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      </g>
    </svg>
  );
}
