"use client";

import Image from "next/image";
import { motion, type Transition } from "motion/react";
import type { HeroTheme } from "@/lib/weather";

const FAR_PEAKS =
  "M0,560 L120,430 L255,505 L420,385 L610,485 L800,405 L1000,470 L1210,415 L1440,500 L1440,900 L0,900 Z";
const MID_HILLS =
  "M0,625 L165,520 L340,595 L520,500 L705,600 L905,510 L1125,610 L1305,540 L1440,600 L1440,900 L0,900 Z";

const PINE_COUNT = 26;
const pines = Array.from({ length: PINE_COUNT }).map((_, i) => {
  const x = -10 + (i * (1460 / (PINE_COUNT - 1)));
  const seed = (i * 53) % 100;
  const height = 95 + (seed % 70);
  const width = 30 + (seed % 16);
  const sway = i % 3 === 0;
  const dark = i % 2 === 0;
  return { x, height, width, sway, dark, key: i };
});

// Sun/moon/stars/clouds are plain HTML layers positioned in percentages of
// the actual rendered hero (not the 1440x900 SVG viewBox below). The SVG
// uses `preserveAspectRatio="... slice"` to keep the ground/road glued to
// the bottom of every viewport, which on any screen wider than the 1440x900
// design ratio means the *top* of the viewBox — where the sun/moon/stars
// used to live — gets cropped clean off-canvas. Percentage-positioned HTML
// siblings never get cropped like that, so this is what actually makes
// them show up (and stay responsive) on real screens.
const STAR_COUNT = 46;
const stars = Array.from({ length: STAR_COUNT }).map((_, i) => {
  const seed = (i * 41) % 100;
  // Real starfields read as mostly small pinpricks with a handful of
  // noticeably bigger/brighter stars scattered in — not one uniform size.
  const big = seed % 5 === 0;
  const size = big ? 3 + (seed % 10) / 6 : 1.8 + (seed % 10) / 7;
  return {
    key: i,
    leftPct: ((i * (100 / STAR_COUNT) + (seed % 30) / 1440 * 100)) % 100,
    topPct: (3 + (seed % 300) / 900 * 100),
    size,
    peak: big ? 1 : 0.7 + (seed % 10) / 30,
    delay: (seed % 40) / 10,
    dur: 2 + (seed % 30) / 10,
  };
});

const BOKEH = [
  { x: "68%", y: "14%", size: 26, delay: "0s", dur: "9s" },
  { x: "78%", y: "26%", size: 14, delay: "1.4s", dur: "7s" },
  { x: "85%", y: "12%", size: 18, delay: "0.6s", dur: "8s" },
  { x: "60%", y: "22%", size: 10, delay: "2.1s", dur: "6.5s" },
  { x: "74%", y: "34%", size: 22, delay: "0.9s", dur: "10s" },
  { x: "90%", y: "22%", size: 12, delay: "1.8s", dur: "7.5s" },
];

// Kept close to the centre gap between the copy column and the booking-form
// column (the same "keyhole" the readability veil already fades into) so
// they read as sky above the car rather than sitting behind either panel.
const SUN_MOON_POS = { leftPct: 56, topPct: 16 };

const CLOUDS = [
  { leftPct: 18, topPct: 17, widthPx: 130, heightPx: 34, dur: "48s", op: 0.5 },
  { leftPct: 53, topPct: 11, widthPx: 170, heightPx: 40, dur: "64s", op: 0.4 },
  { leftPct: 73, topPct: 26, widthPx: 115, heightPx: 30, dur: "40s", op: 0.35 },
  { leftPct: 31, topPct: 29, widthPx: 150, heightPx: 32, dur: "56s", op: 0.3 },
];

// Single black SUV highway loop: drives fully off-screen to the left,
// pauses off-screen, then drives fully off-screen back to the right,
// pauses off-screen, and repeats — never idling in view. Eases with
// `easeInOut` (a gentle pull-away and slow-to-a-stop, never a
// constant-velocity snap). The artwork's left/right flip lands exactly in
// the middle of the off-screen pause, so the swap is never seen. Position
// is split across two CSS properties that compose additively: `left` (a
// percentage of the *container*, 0%/100%) places the car at the near
// edge, and `x` (a percentage transform, relative to the car's *own*
// width) pushes it one full car-width further past that edge. That combo
// is resolution-independent — it fully clears the frame at every
// breakpoint without per-size tuning, since it's expressed in the car's
// own width rather than a hand-picked container percentage. Module-level
// (not recreated per render) so Motion doesn't reset the keyframe
// sequence on every re-render.
const HIGHWAY_LOOP_SECONDS = 16;

// Half-width (as a fraction of the loop) of the off-screen pause at each
// end. The two 0.06-wide slivers either side of t=0/1 combine, across the
// loop wrap, into one continuous ~1.9s stop off-screen right — matching
// the single ~1.9s stop written explicitly off-screen left (0.44–0.56).
const TURN_HOLD = 0.06;
const POSITION_TIMES = [0, TURN_HOLD, 0.5 - TURN_HOLD, 0.5 + TURN_HOLD, 1 - TURN_HOLD, 1];

const POSITION_TRANSITION: Transition = {
  duration: HIGHWAY_LOOP_SECONDS,
  repeat: Infinity,
  ease: "easeInOut",
  times: POSITION_TIMES,
};

// The flip's swap lands at t = 0.5 — the middle of the off-screen-left
// pause, where the car is already fully hidden and stationary. The
// matching swap off-screen right needs no extra keyframe: it falls for
// free at the loop's own wrap (t = 1 back to t = 0), the middle of that
// edge's own pause. The two middle keyframes sit a hair apart (not on the
// same instant) — a literal zero-duration segment is a known Motion
// footgun on looping keyframe tracks — so the swap is a ~30ms snap, not
// truly instant, but it happens off-screen so it's never visible either way.
const FLIP_TRANSITION: Transition = {
  duration: HIGHWAY_LOOP_SECONDS,
  repeat: Infinity,
  ease: "linear",
  times: [0, 0.499, 0.501, 1],
};
const FLIP_KEYFRAMES = [-1, -1, 1, 1];

// Starts held off-screen right (facing left, ready to drive left), drives
// fully off-screen left, pauses, flips to face right, then drives back.
const CAR_LEFT_KEYFRAMES = ["100%", "100%", "0%", "0%", "100%", "100%"];
const CAR_X_KEYFRAMES = ["0%", "0%", "-100%", "-100%", "0%", "0%"];

// Sits a bit lower than before so it reads as centered on the road surface
// rather than riding its top edge.
const CAR_STYLE =
  "top-[81%] w-[150px] z-[5] sm:top-[78%] sm:w-[195px] md:top-[74%] md:w-[235px] lg:top-[71%] lg:w-[275px]";

// A stationary bank of ground fog sitting at dead-centre of the frame — not
// weather (that's `showFog`/`foggy` below), but a fixed "foggy stretch of
// road" the car drives through on every lap, in both directions. The car's
// position is an eased triangle wave, so by the symmetry of `easeInOut` the
// moment it crosses screen-centre falls exactly at the midpoint of each
// drive segment: t=0.25 for the left-bound pass (0.06 -> 0.44) and t=0.75
// for the right-bound pass (0.56 -> 0.94). Using those two instants as the
// peak of a rise/fall keyframe pair keeps the fog bank, the car's dip in
// opacity/focus, and the headlight flash all locked to the drive loop's own
// clock — no separate timer, nothing that can drift out of sync.
const FOG_ZONE_HALF = 0.07;
const FOG_CENTER_LEFTBOUND = 0.25;
const FOG_CENTER_RIGHTBOUND = 0.75;
const FOG_TIMES = [
  0,
  FOG_CENTER_LEFTBOUND - FOG_ZONE_HALF,
  FOG_CENTER_LEFTBOUND,
  FOG_CENTER_LEFTBOUND + FOG_ZONE_HALF,
  0.5,
  FOG_CENTER_RIGHTBOUND - FOG_ZONE_HALF,
  FOG_CENTER_RIGHTBOUND,
  FOG_CENTER_RIGHTBOUND + FOG_ZONE_HALF,
  1,
];
// A single `ease` string applied alongside multi-point `times` warps the
// *whole* 0-1 timeline (that's how FLIP_TRANSITION above ends up needing
// "linear" instead of "easeInOut" to land its swap exactly on the
// turnaround) — it doesn't just shape each segment in place, it also shifts
// where each keyframe actually falls in real time. Because our two peaks
// sit at asymmetric-looking fractions (0.25 vs 0.75) that's invisible for a
// flat hold (POSITION_TRANSITION's use case, where the value doesn't change
// either way) but very visible here: it dragged the two "8s apart" peaks to
// ~5s and ~11s apart instead. Per-segment easing sidesteps that — each
// segment's shape is independent, but its time window stays exactly where
// `times` puts it — so `linear` holds the flats at true 0, and `easeIn` /
// `easeOut` only smooth the rise into and fall out of each peak.
const FOG_EASE: Transition["ease"] = ["linear", "easeIn", "easeOut", "linear", "linear", "easeIn", "easeOut", "linear"];
const FOG_TRANSITION: Transition = {
  duration: HIGHWAY_LOOP_SECONDS,
  repeat: Infinity,
  ease: FOG_EASE,
  times: FOG_TIMES,
};

// Shape shared by everything the fog patch drives: 0 the rest of the loop,
// rising to a peak right at each screen-centre crossing, falling back to 0
// as the car clears it.
const FOG_PATCH_OPACITY = [0, 0, 0.85, 0, 0, 0, 0.85, 0, 0];
// Headlight flash used only when the car isn't already lit for weather —
// same shape, so the beam switches on exactly as the car enters the patch
// and off as it exits, never lingering either side.
const FOG_HEADLIGHT_OPACITY = [0, 0, 0.95, 0, 0, 0, 0.95, 0, 0];

// Pre-multiplied against the fog shape and kept module-level for the same
// reason as the position/flip keyframes above: an array built fresh inside
// the component on every render is a *new* target as far as Motion is
// concerned, which restarts the whole 16s keyframe track from zero on any
// unrelated re-render (e.g. the weather widget ticking) — turning a clean
// 8s-apart bump into whatever phase the last re-render happened to land on.
// Two fixed variants (clear vs. weather-foggy) sidestep that; only an actual
// `foggy` transition swaps the reference, same as everywhere else here.
const CAR_OPACITY_CLEAR = FOG_PATCH_OPACITY.map((v) => 1 - v * 0.3);
const CAR_OPACITY_FOGGY = FOG_PATCH_OPACITY.map((v) => 0.82 - v * 0.3);
const CAR_BLUR_KEYFRAMES = FOG_PATCH_OPACITY.map((v) => `blur(${(v * 2.5).toFixed(1)}px)`);

function skyStops(theme: HeroTheme): [string, string, string] {
  const night = theme.timeOfDay === "night";
  if (night) {
    switch (theme.sky) {
      case "storm":
        return ["#090c11", "#0c0f16", "#11151d"];
      case "rain":
        return ["#0c121a", "#111923", "#18212b"];
      case "fog":
        return ["#161c21", "#1d2429", "#252d33"];
      case "cloudy":
        return ["#0a0f19", "#101828", "#172136"];
      default:
        return ["#040914", "#091124", "#0e1b32"];
    }
  }
  switch (theme.sky) {
    case "storm":
      return ["#5a6572", "#6d7986", "#89929e"];
    case "rain":
      return ["#7b8894", "#93a0ab", "#a9b4bf"];
    case "fog":
      return ["#e2e5e3", "#ecefec", "#f4f1ea"];
    case "cloudy":
      return ["#dee6e1", "#e7ece7", "#eef1e9"];
    default:
      return ["#eaf6fc", "#fdf1da", "#e9f3e6"];
  }
}

function overlayWash(theme: HeroTheme): { color: string; opacity: number; blend: "multiply" | "screen" | "normal" } {
  const night = theme.timeOfDay === "night";
  if (night) return { color: "#040a16", opacity: 0.42, blend: "multiply" };
  switch (theme.sky) {
    case "storm":
      return { color: "#28323c", opacity: 0.4, blend: "multiply" };
    case "rain":
      return { color: "#2f3a44", opacity: 0.28, blend: "multiply" };
    case "fog":
      return { color: "#ffffff", opacity: 0.5, blend: "screen" };
    case "cloudy":
      return { color: "#c9d3ce", opacity: 0.18, blend: "multiply" };
    default:
      return { color: "#000000", opacity: 0, blend: "normal" };
  }
}

export function ForestHero({ theme }: { theme: HeroTheme }) {
  const isNight = theme.timeOfDay === "night";
  const showRain = theme.sky === "rain" || theme.sky === "storm";
  const showStorm = theme.sky === "storm";
  const showFog = theme.sky === "fog";
  const showClouds = theme.sky === "cloudy" || showRain;
  const showSun = !isNight && (theme.sky === "clear" || theme.sky === "cloudy");
  const showMoon = isNight && !showStorm;
  // Rain shouldn't hide the sky the way full overcast (storm) does — moon/stars
  // stay visible through rain, only a genuine storm blocks them.
  const showStars = isNight && !showStorm;
  // Headlights glow whenever the scene reads as "dark" in the broad sense:
  // genuine night, or low-visibility weather (rain/storm/fog) at any hour —
  // matching how drivers actually switch lights on for moody, overcast days.
  const lightsOn = isNight || showRain || showFog;

  const [skyTop, skyMid, skyBottom] = skyStops(theme);
  const wash = overlayWash(theme);
  const moonShadowOffset = 92 * (1 - theme.moonIllumination);
  const cloudCount = showStorm ? CLOUDS.length : showClouds ? 3 : 2;
  const cloudFill = showStorm ? "#3a4550" : isNight ? "#aeb9c4" : "#ffffff";
  const cloudOpacityMul = showStorm ? 1.6 : isNight ? 0.5 : 1;

  return (
    <div className="absolute inset-0 overflow-hidden bg-ivory-50" aria-hidden>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <motion.stop offset="0%" animate={{ stopColor: skyTop }} transition={{ duration: 1.4, ease: "easeInOut" }} />
            <motion.stop offset="45%" animate={{ stopColor: skyMid }} transition={{ duration: 1.4, ease: "easeInOut" }} />
            <motion.stop offset="100%" animate={{ stopColor: skyBottom }} transition={{ duration: 1.4, ease: "easeInOut" }} />
          </linearGradient>
          <filter id="hero-blur-mist" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <rect width="1440" height="900" fill="url(#hero-sky)" />

        <path d={FAR_PEAKS} fill="#cfe3da" opacity="0.65" />
        <path d={MID_HILLS} fill="#2f8a6e" opacity="0.42" />
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            d={`M-20 ${640 - i * 13} Q720 ${600 - i * 13} 1460 ${640 - i * 13}`}
            stroke="#1b5744"
            strokeWidth="6"
            fill="none"
            opacity={0.12 + i * 0.03}
          />
        ))}

        <g>
          {pines.map((p) => (
            <path
              key={p.key}
              d={`M${p.x} 760 L${p.x} ${760 - p.height} L${p.x - p.width / 2} ${760 - p.height + p.height * 0.42} L${p.x - p.width / 3.2} ${760 - p.height + p.height * 0.42} L${p.x - p.width * 0.62} ${760 - p.height * 0.35} L${p.x - p.width * 0.3} ${760 - p.height * 0.35} L${p.x - p.width * 0.7} 760 Z
                 M${p.x} 760 L${p.x} ${760 - p.height} L${p.x + p.width / 2} ${760 - p.height + p.height * 0.42} L${p.x + p.width / 3.2} ${760 - p.height + p.height * 0.42} L${p.x + p.width * 0.62} ${760 - p.height * 0.35} L${p.x + p.width * 0.3} ${760 - p.height * 0.35} L${p.x + p.width * 0.7} 760 Z`}
              fill={p.dark ? "#123f31" : "#1b5744"}
              opacity={0.88}
              className={p.sway ? "animate-sway-slow" : undefined}
              style={{ transformOrigin: `${p.x}px 760px` }}
            />
          ))}
        </g>

        <ellipse
          cx="230"
          cy="775"
          rx="150"
          ry="18"
          fill="#fbf8f2"
          opacity={showFog ? 0.75 : 0.3}
          filter="url(#hero-blur-mist)"
          className="animate-mist-drift"
        />
        <ellipse
          cx="980"
          cy="782"
          rx="190"
          ry="20"
          fill="#fbf8f2"
          opacity={showFog ? 0.7 : 0.28}
          filter="url(#hero-blur-mist)"
          className="animate-mist-drift"
          style={{ animationDelay: "3s" }}
        />
        {showFog && (
          <ellipse
            cx="600"
            cy="700"
            rx="900"
            ry="60"
            fill="#fbf8f2"
            opacity="0.55"
            filter="url(#hero-blur-mist)"
            className="animate-mist-drift"
            style={{ animationDelay: "1.4s" }}
          />
        )}

        <rect x="0" y="780" width="1440" height="120" fill="#17181a" opacity="0.85" />
        <rect x="0" y="780" width="1440" height="10" fill="#59584f" opacity="0.4" />
      </svg>

      {/* Sun / moon / stars / clouds — a plain HTML layer positioned in
          percentages of the hero itself, not the SVG's viewBox, so nothing
          here can get cropped by the cover-fit slicing above (see the note
          by the `stars`/`CLOUDS`/`SUN_MOON_POS` constants). */}
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
        {showClouds &&
          CLOUDS.slice(0, cloudCount).map((c, i) => (
            <span
              key={i}
              className="absolute animate-cloud-drift rounded-full blur-[14px]"
              style={{
                left: `${c.leftPct}%`,
                top: `${c.topPct}%`,
                width: c.widthPx,
                height: c.heightPx,
                background: cloudFill,
                opacity: Math.min(0.85, c.op * cloudOpacityMul),
                animationDuration: c.dur,
              }}
            />
          ))}

        {showSun && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${SUN_MOON_POS.leftPct}%`, top: `${SUN_MOON_POS.topPct}%` }}
          >
            {theme.sky === "clear" && (
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: "clamp(180px, 20vw, 320px)",
                  height: "clamp(180px, 20vw, 320px)",
                  mixBlendMode: "screen",
                  background:
                    "repeating-conic-gradient(from 0deg, rgba(251,233,191,0.26) 0deg 3deg, transparent 3deg 22deg)",
                }}
                animate={{ rotate: 360, opacity: [0.8, 1, 0.8] }}
                transition={{
                  rotate: { duration: 90, repeat: Infinity, ease: "linear" },
                  opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            )}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{
                width: "clamp(140px, 16vw, 260px)",
                height: "clamp(140px, 16vw, 260px)",
                background:
                  "radial-gradient(circle, rgba(255,242,207,0.95) 0%, rgba(243,211,143,0.4) 55%, rgba(220,192,139,0) 100%)",
              }}
              animate={
                theme.sky === "cloudy"
                  ? { opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }
                  : { opacity: [0.78, 1, 0.78], scale: [1, 1.1, 1] }
              }
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="relative rounded-full bg-[#fff4da]"
              style={{
                width: "clamp(56px, 6vw, 92px)",
                height: "clamp(56px, 6vw, 92px)",
                opacity: theme.sky === "cloudy" ? 0.55 : 0.95,
              }}
            />
          </div>
        )}

        {showMoon && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${SUN_MOON_POS.leftPct}%`, top: `${SUN_MOON_POS.topPct}%` }}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{
                width: "clamp(120px, 14vw, 220px)",
                height: "clamp(120px, 14vw, 220px)",
                background: "radial-gradient(circle, rgba(238,242,246,0.85) 0%, rgba(238,242,246,0) 100%)",
                opacity: 0.8,
              }}
            />
            <div
              className="relative overflow-hidden rounded-full bg-[#f2f4f0]"
              style={{ width: "clamp(56px, 6vw, 92px)", height: "clamp(56px, 6vw, 92px)" }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ left: `${(moonShadowOffset / 84) * 100}%`, background: skyTop }}
              />
            </div>
          </div>
        )}
      </div>

      {theme.sky === "clear" && !isNight && (
        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
          {BOKEH.map((b, i) => (
            <span
              key={i}
              className="absolute animate-float rounded-full"
              style={{
                left: b.x,
                top: b.y,
                width: b.size,
                height: b.size,
                background: "radial-gradient(circle, rgba(255,244,214,0.85) 0%, rgba(255,244,214,0) 72%)",
                animationDuration: b.dur,
                animationDelay: b.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Weather colour-wash — tints the whole scene toward the current mood without recolouring every shape. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1]"
        animate={{ backgroundColor: wash.color, opacity: wash.opacity }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{ mixBlendMode: wash.blend }}
      />

      {/* Stars sit above the weather colour-wash (not inside the sky layer
          below), so the wash's multiply blend — which is what mutes the
          sun/moon/clouds toward the current mood — doesn't also grey out
          these tiny points down to near-invisible. Real starlight reads as
          punching through haze anyway. */}
      {showStars && (
        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
          {stars.map((s) => (
            <motion.span
              key={s.key}
              className="absolute rounded-full bg-white"
              style={{ left: `${s.leftPct}%`, top: `${s.topPct}%`, width: s.size, height: s.size }}
              animate={{ opacity: [s.peak * 0.5, s.peak, s.peak * 0.5] }}
              transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
            />
          ))}
        </div>
      )}

      {showRain && (
        <div
          className="pointer-events-none absolute inset-0 z-[2] animate-rain-fall"
          style={{
            opacity: showStorm ? 0.55 : 0.4,
            backgroundImage:
              "repeating-linear-gradient(100deg, rgba(230,240,250,0.5) 0px, rgba(230,240,250,0.5) 1px, transparent 1px, transparent 16px)",
            backgroundSize: "120px 220px",
          }}
        />
      )}

      {showStorm && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[3] bg-[#eef4ff]"
          animate={{ opacity: [0, 0, 0.75, 0.1, 0, 0, 0, 0, 0, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear", times: [0, 0.28, 0.3, 0.33, 0.36, 0.5, 0.6, 0.75, 0.9, 1] }}
        />
      )}

      <div
        className="road-texture absolute inset-x-0 opacity-70"
        style={{ top: "89.5%", height: "3px" }}
      />
      {showRain && (
        <div
          className="pointer-events-none absolute inset-x-0 opacity-40"
          style={{
            top: "89.5%",
            height: "10px",
            background: "linear-gradient(to bottom, rgba(200,220,235,0.5), transparent)",
            filter: "blur(2px)",
          }}
        />
      )}

      {/* z-0, not z-4: sits *below* Hero.tsx's readability veil (z-1) on
          purpose, so the veil's backdrop-blur actually reaches the car
          while it drives through that hazy band — read as fog rather than
          a sharp cutout pasted over blurred glass. Still paints above the
          plain (unindexed) sky/road art beneath it. */}
      <div className="absolute inset-0 z-0">
        <HighwayTraffic lightsOn={lightsOn} foggy={showFog} />
      </div>
    </div>
  );
}

function HighwayTraffic({ lightsOn, foggy }: { lightsOn: boolean; foggy: boolean }) {
  return (
    <>
      <RoadFogBank />
      <RoadCar lightsOn={lightsOn} foggy={foggy} />
    </>
  );
}

/**
 * Soft, blurred haze washed over the scenery at screen-centre with
 * `mixBlendMode: screen` — the same trick the weather colour-wash uses — so
 * the pines/hills/road underneath read as faded and dreamy right where the
 * car is about to pass, rather than literally toggling each image's own
 * opacity. Unpositioned (no z-index) so it always paints behind the car's
 * explicit z-[5], letting the car visibly drive into and out of it.
 */
function RoadFogBank() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 w-[48%] -translate-x-1/2"
      style={{
        top: "38%",
        bottom: 0,
        background:
          "radial-gradient(ellipse 60% 75% at 50% 85%, rgba(255,255,255,0.95), rgba(255,255,255,0.4) 55%, transparent 80%)",
        mixBlendMode: "screen",
        filter: "blur(16px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: FOG_PATCH_OPACITY }}
      transition={FOG_TRANSITION}
    />
  );
}

/**
 * The black SUV. Position glides through an `easeInOut` triangle wave the
 * entire lap — a gentle, continuous deceleration/acceleration at each
 * turnaround, never a mid-drive stop or snap — while a horizontal flip
 * (also landing exactly on the turnaround) keeps the artwork facing
 * whichever way it's actually driving.
 */
function RoadCar({ lightsOn, foggy }: { lightsOn: boolean; foggy: boolean }) {
  // Base opacity already accounts for weather fog (`foggy`); the fog-bank
  // pass dips further below that baseline and recovers, and adds a touch of
  // blur at the same moments — "moving into" and "coming out of" the mist.
  const carOpacityKeyframes = foggy ? CAR_OPACITY_FOGGY : CAR_OPACITY_CLEAR;

  return (
    <motion.div
      className={`absolute ${CAR_STYLE}`}
      initial={{ left: CAR_LEFT_KEYFRAMES[0], x: CAR_X_KEYFRAMES[0] }}
      animate={{ left: CAR_LEFT_KEYFRAMES, x: CAR_X_KEYFRAMES }}
      transition={{ left: POSITION_TRANSITION, x: POSITION_TRANSITION }}
    >
      <motion.div
        animate={{ rotate: [-0.5, 0.5, -0.5], y: [0, -2, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <motion.div
          initial={{ scaleX: FLIP_KEYFRAMES[0], opacity: carOpacityKeyframes[0], filter: CAR_BLUR_KEYFRAMES[0] }}
          animate={{ scaleX: FLIP_KEYFRAMES, opacity: carOpacityKeyframes, filter: CAR_BLUR_KEYFRAMES }}
          transition={{ scaleX: FLIP_TRANSITION, opacity: FOG_TRANSITION, filter: FOG_TRANSITION }}
          style={{ transformOrigin: "50% 50%" }}
        >
          <motion.div
            className="absolute -bottom-1 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-full bg-charcoal-900/40 blur-sm"
            animate={{ scaleX: [1, 0.85, 1], opacity: [0.4, 0.25, 0.4] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Front headlights, always mounted: when weather already has
              lights on (night, rain, storm or ambient fog) they pulse
              continuously; otherwise they stay off except for a flash
              exactly while the car is crossing the fog bank above, so
              lights visibly switch on entering the mist and off leaving it.
              Positioned for the artwork's native facing; the scaleX flip
              above mirrors the beam along with the car body, so it always
              points the way the car is actually driving. */}
          <HeadlightBeam side="right" intense={foggy} lightsOn={lightsOn} />

          {/* Mask feathers the PNG's own empty canvas margins; scoped to the
              image only so it doesn't also dim the headlight beam above. */}
          <div
            style={{
              WebkitMaskImage: "radial-gradient(ellipse 68% 62% at 50% 52%, black 58%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 68% 62% at 50% 52%, black 58%, transparent 100%)",
            }}
          >
            <Image
              src="/images/hero/car-facing-right.png"
              alt=""
              width={800}
              height={800}
              preload
              className="relative w-full drop-shadow-[0_14px_18px_rgba(7,31,24,0.35)]"
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Measured directly off the car-facing-right.png artwork (trimmed to its
// non-transparent bounds, then the headlight lens cluster located within
// that box): the lamp sits at roughly 95.5% across, 54.5% down. Everything
// below is anchored to that point rather than an eyeballed guess, so the
// glow and beam visibly originate from the actual headlight instead of
// floating mid-door.
const HEADLIGHT_X = 95.5;
const HEADLIGHT_Y = 54.5;
const BULB_SIZE = 9;

// A medium yellow-orange mix, lightened with a bit of white so it doesn't
// read as a deep/saturated amber: a hot core at the lamp fading through
// orange as it spreads and dissipates, closer to a warm halogen headlight
// than a cool LED one.
const BEAM_CORE = "255,228,181";
const BEAM_MID = "255,203,153";
const BEAM_FAR = "255,186,142";

function HeadlightBeam({
  side,
  intense,
  lightsOn,
}: {
  side: "left" | "right";
  intense: boolean;
  lightsOn: boolean;
}) {
  const isRight = side === "right";
  const originX = isRight ? HEADLIGHT_X : 100 - HEADLIGHT_X;

  const bulbStyle: React.CSSProperties = {
    left: `${originX - BULB_SIZE / 2}%`,
    top: `${HEADLIGHT_Y - BULB_SIZE / 2}%`,
    width: `${BULB_SIZE}%`,
    height: `${BULB_SIZE}%`,
    borderRadius: "9999px",
    background: `radial-gradient(circle, rgba(${BEAM_CORE},0.95) 0%, rgba(${BEAM_MID},0.55) 55%, rgba(${BEAM_FAR},0) 100%)`,
    filter: "blur(1px)",
  };

  // Wedge fans out from the lamp toward whichever way the car is facing —
  // apex pinned to the measured headlight point, widening as it travels
  // forward and off the edge of the artwork.
  const beamStyle: React.CSSProperties = isRight
    ? {
        left: `${originX}%`,
        top: `${HEADLIGHT_Y - 14}%`,
        width: "58%",
        height: "28%",
        background: `linear-gradient(to left, rgba(${BEAM_FAR},0), rgba(${BEAM_MID},0.55) 45%, rgba(${BEAM_CORE},0.85) 100%)`,
        clipPath: "polygon(0% 42%, 0% 58%, 100% 100%, 100% 0%)",
      }
    : {
        left: `${originX - 58}%`,
        top: `${HEADLIGHT_Y - 14}%`,
        width: "58%",
        height: "28%",
        background: `linear-gradient(to right, rgba(${BEAM_FAR},0), rgba(${BEAM_MID},0.55) 45%, rgba(${BEAM_CORE},0.85) 100%)`,
        clipPath: "polygon(100% 42%, 100% 58%, 0% 100%, 0% 0%)",
      };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ mixBlendMode: "screen" }}
      initial={{ opacity: lightsOn ? (intense ? 0.85 : 0.75) : 0 }}
      animate={
        lightsOn
          ? { opacity: intense ? [0.85, 1, 0.85] : [0.75, 1, 0.75] }
          : { opacity: FOG_HEADLIGHT_OPACITY }
      }
      transition={lightsOn ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : FOG_TRANSITION}
    >
      <div className="absolute" style={{ ...beamStyle, filter: "blur(1.5px)" }} />
      <div className="absolute" style={bulbStyle} />
    </motion.div>
  );
}
