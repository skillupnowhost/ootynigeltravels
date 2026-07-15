const VARIANTS = ["mountains", "tea-rows", "lake", "forest", "wildlife"] as const;
export type ScenicVariant = (typeof VARIANTS)[number];

function pickVariant(seed: string): ScenicVariant {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return VARIANTS[hash % VARIANTS.length];
}

/**
 * Procedurally generated brand-consistent scenery — used wherever a
 * destination/package doesn't have real photography, instead of stock images.
 */
export function ScenicArt({
  variant,
  seed = "ooty",
  className = "",
}: {
  variant?: ScenicVariant;
  seed?: string;
  className?: string;
}) {
  const v = variant ?? pickVariant(seed);
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3F8F5" />
          <stop offset="100%" stopColor="#E4EEE9" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#sky-${seed})`} />

      {v === "mountains" && (
        <>
          <path d="M0 200 L70 110 L120 170 L180 90 L250 180 L310 130 L400 210 L400 300 L0 300 Z" fill="#123F31" opacity="0.9" />
          <path d="M0 240 L90 170 L160 220 L230 150 L300 230 L400 190 L400 300 L0 300 Z" fill="#1B5744" opacity="0.85" />
          <circle cx="330" cy="70" r="26" fill="#C8A15C" opacity="0.35" />
        </>
      )}

      {v === "tea-rows" && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M-20 ${260 - i * 14} Q200 ${230 - i * 14} 420 ${260 - i * 14}`}
              stroke="#24705A"
              strokeWidth="10"
              fill="none"
              opacity={0.25 + i * 0.06}
            />
          ))}
          <circle cx="60" cy="60" r="22" fill="#C8A15C" opacity="0.3" />
        </>
      )}

      {v === "lake" && (
        <>
          <path d="M0 190 L100 140 L200 175 L300 120 L400 165 L400 300 L0 300 Z" fill="#1B5744" opacity="0.85" />
          <rect x="0" y="210" width="400" height="90" fill="#2F8A6E" opacity="0.35" />
          <ellipse cx="200" cy="255" rx="150" ry="10" fill="#0B3B2E" opacity="0.15" />
        </>
      )}

      {v === "forest" && (
        <>
          {Array.from({ length: 12 }).map((_, i) => {
            const x = (i * 37) % 400;
            const h = 60 + ((i * 53) % 70);
            return (
              <path
                key={i}
                d={`M${x} 300 L${x} ${300 - h} L${x - 22} ${300 - h + 34} L${x + 22} ${300 - h + 34} Z`}
                fill={i % 2 === 0 ? "#123F31" : "#1B5744"}
                opacity="0.85"
              />
            );
          })}
        </>
      )}

      {v === "wildlife" && (
        <>
          <path d="M0 230 L120 160 L240 210 L400 150 L400 300 L0 300 Z" fill="#123F31" opacity="0.88" />
          <circle cx="90" cy="100" r="16" fill="#C8A15C" opacity="0.4" />
          <path d="M300 260 Q330 220 360 260" stroke="#0B3B2E" strokeWidth="6" fill="none" opacity="0.5" />
        </>
      )}
    </svg>
  );
}
