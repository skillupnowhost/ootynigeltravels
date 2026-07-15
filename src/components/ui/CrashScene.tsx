"use client";

import { motion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

const STEAM_PUFFS = [
  { cx: 268, delay: 0 },
  { cx: 280, delay: 0.5 },
  { cx: 258, delay: 1 },
];

const DIZZY_STARS = [
  { angle: 0, delay: 0 },
  { angle: 120, delay: 0.25 },
  { angle: 240, delay: 0.5 },
];

const DEBRIS = [
  { x: 118, y: 232, r: 3.4, delay: 0.55 },
  { x: 340, y: 238, r: 2.6, delay: 0.7 },
  { x: 356, y: 220, r: 2, delay: 0.85 },
  { x: 100, y: 214, r: 2, delay: 0.65 },
];

const star = "M0 -5 C0.5 -1.5 1.5 -0.5 5 0 C1.5 0.5 0.5 1.5 0 5 C-0.5 1.5 -1.5 0.5 -5 0 C-1.5 -0.5 -0.5 -1.5 0 -5 Z";

/**
 * A tasteful, cartoon-style roadside fender-bender: a car that's just
 * clipped a bent "404" milepost — steam, dizzy stars, a hazard triangle
 * and fresh skid marks tell the story without anything graphic.
 */
export function CrashScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 300"
      className={className}
      role="img"
      aria-label="Illustration of a car that has taken a wrong turn and bumped into a 404 signpost"
    >
      {/* impact dust glow */}
      <motion.ellipse
        cx="230"
        cy="228"
        rx="120"
        ry="26"
        fill="#d2b174"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.16, scale: 1 }}
        transition={{ duration: 0.9, ease }}
      />

      {/* road */}
      <rect x="0" y="238" width="480" height="62" fill="#0e2018" />
      <rect x="0" y="238" width="480" height="4" fill="#1b5744" opacity="0.5" />

      {/* skid marks drawing in on impact */}
      <motion.path
        d="M20 262 C 90 258, 140 250, 205 236"
        stroke="#59584f"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.1 }}
      />
      <motion.path
        d="M34 278 C 100 274, 150 262, 212 248"
        stroke="#59584f"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.2 }}
      />

      {/* bent 404 signpost, struck and leaning */}
      <g transform="translate(150 0)">
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: 10 }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
          style={{ originX: "150px", originY: "238px" }}
        >
          <path d="M148 238 C 150 190, 152 150, 158 118" stroke="#3a4a42" strokeWidth="6" strokeLinecap="round" fill="none" />
          <g transform="translate(158 118) rotate(-8)">
            <rect x="-38" y="-24" width="80" height="42" rx="6" fill="#123f31" stroke="#d2b174" strokeWidth="2" />
            <text x="2" y="4" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fbf8f2" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
              404
            </text>
            <path d="M-38 -24 L-24 -10" stroke="#fbf8f2" strokeWidth="1.5" opacity="0.5" />
          </g>
        </motion.g>
      </g>

      {/* car */}
      <motion.g
        initial={{ x: 40, rotate: 0 }}
        animate={{ x: 0, rotate: -7 }}
        transition={{ duration: 0.6, ease, delay: 0.05 }}
        style={{ originX: "265px", originY: "230px" }}
      >
        <motion.g
          animate={{ rotate: [-0.6, 0.6, -0.6] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "265px", originY: "230px" }}
        >
          {/* rear wheel */}
          <circle cx="212" cy="234" r="16" fill="#0e2018" stroke="#d2b174" strokeWidth="2.5" />
          <circle cx="212" cy="234" r="5" fill="#d2b174" opacity="0.7" />

          {/* front wheel, knocked askew */}
          <g transform="translate(322 236) rotate(18)">
            <ellipse cx="0" cy="0" rx="16" ry="14" fill="#0e2018" stroke="#d2b174" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="5" fill="#d2b174" opacity="0.7" />
          </g>

          {/* body */}
          <path
            d="M198 222 L206 196 C 210 186, 220 180, 232 180 L268 180 C 280 180, 292 186, 300 196 L322 210 L322 224 L198 224 Z"
            fill="#c8a15c"
            stroke="#0e2018"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M198 224 L322 224 L322 234 L198 234 Z" fill="#a67c34" stroke="#0e2018" strokeWidth="2.5" strokeLinejoin="round" />

          {/* windshield with crack */}
          <path d="M234 184 L262 184 L272 202 L226 202 Z" fill="#e6f0ea" opacity="0.9" />
          <path d="M240 186 L252 202 M262 188 L246 200 M234 196 L258 192" stroke="#0e2018" strokeWidth="1.2" opacity="0.6" />

          {/* crumpled front bumper */}
          <path d="M300 196 L308 200 L304 206 L312 210 L308 216 L316 222 L322 224" fill="none" stroke="#0e2018" strokeWidth="2" strokeLinejoin="round" />

          {/* cracked headlight */}
          <circle cx="314" cy="212" r="5" fill="#fbf8f2" />
          <path d="M311 209 L317 215 M317 209 L311 215" stroke="#0e2018" strokeWidth="1" />

          {/* popped hood, still bouncing */}
          <motion.path
            d="M270 182 L302 194 L296 200 L266 190 Z"
            fill="#d2b174"
            stroke="#0e2018"
            strokeWidth="2"
            strokeLinejoin="round"
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "270px", originY: "182px" }}
          />

          {/* steam from under the hood */}
          {STEAM_PUFFS.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.cx}
              cy="178"
              r="5"
              fill="#fbf8f2"
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 0.55, 0], y: -34, scale: 1.4 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: p.delay }}
            />
          ))}
        </motion.g>
      </motion.g>

      {/* dizzy stars circling above the roof */}
      <g transform="translate(255 158)">
        {DIZZY_STARS.map((s, i) => (
          <motion.g
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear", delay: s.delay }}
          >
            <motion.path
              d={star}
              fill="#d2b174"
              transform={`rotate(${s.angle}) translate(22 0)`}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
            />
          </motion.g>
        ))}
      </g>

      {/* hazard warning triangle */}
      <motion.g
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease, delay: 0.5 }}
      >
        <motion.g
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "150px", originY: "226px" }}
        >
          <path d="M150 202 L168 232 L132 232 Z" fill="#123f31" stroke="#d2b174" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="150" y1="212" x2="150" y2="221" stroke="#d2b174" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="150" cy="226" r="1.6" fill="#d2b174" />
        </motion.g>
      </motion.g>

      {/* scattered debris */}
      {DEBRIS.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill="#e6d1a8"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 0.4, ease, delay: d.delay }}
        />
      ))}
    </svg>
  );
}
