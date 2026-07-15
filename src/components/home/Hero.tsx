import { ChevronDown, Sun, Moon, Cloud, CloudFog, CloudRain, CloudLightning } from "lucide-react";
import { MotionIcon } from "@/components/ui/MotionIcon";
import {
  SparkleBurstIcon,
  ShieldBadgeIcon,
  CalendarCheckIcon,
} from "@/components/ui/AnimatedIcons";
import { LinkButton } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ForestHero } from "./ForestHero";
import { HeroWordCycle } from "./HeroWordCycle";
import { BrandKicker } from "./BrandKicker";
import { PlanJourneyForm } from "@/components/booking/PlanJourneyForm";
import type { Destination, TourPackage } from "@/lib/db/types";
import type { HeroTheme, SkyCondition } from "@/lib/weather";

const SKY_LABEL: Record<SkyCondition, string> = {
  clear: "Clear Skies",
  cloudy: "Partly Cloudy",
  fog: "Misty Hills",
  rain: "Light Rain",
  storm: "Thunderstorms",
};

const SKY_ICON: Record<SkyCondition, typeof Sun> = {
  clear: Sun,
  cloudy: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  storm: CloudLightning,
};

const HIGHLIGHTS = [
  {
    icon: SparkleBurstIcon,
    title: "Curated Itineraries",
    copy: "Signature packages across every essential Ooty stop.",
  },
  {
    icon: ShieldBadgeIcon,
    title: "Trusted & Verified",
    copy: "Vetted stays, permits arranged ahead, 24×7 support.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Plan in Minutes",
    copy: "No account, no hassle — just pick your dates and go.",
  },
];

export function Hero({
  destinations,
  packages,
  theme,
}: {
  destinations: Destination[];
  packages: TourPackage[];
  theme: HeroTheme;
}) {
  const isNight = theme.timeOfDay === "night";
  const WeatherGlyph = isNight && theme.sky === "clear" ? Moon : SKY_ICON[theme.sky];
  const weatherLine =
    theme.temperatureC != null
      ? `${Math.round(theme.temperatureC)}°C in Ooty right now — ${SKY_LABEL[theme.sky]}`
      : `Live in Ooty — ${SKY_LABEL[theme.sky]}`;

  return (
    <section className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-ivory-50">
      <ForestHero theme={theme} />

      {/* Readability veil behind the copy — a genuine frosted-mist blur. The
          car intentionally sits behind this layer (see ForestHero) so it
          reads as driving through the haze instead of floating over it;
          the mask's fade past 68% keeps the veil off the booking form. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] transition-colors duration-700"
        style={{
          background: isNight
            ? "linear-gradient(90deg, var(--color-forest-950) 0%, color-mix(in oklab, var(--color-forest-950) 65%, transparent) 38%, transparent 68%)"
            : "linear-gradient(90deg, var(--color-ivory-50) 0%, color-mix(in oklab, var(--color-ivory-50) 65%, transparent) 38%, transparent 68%)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          WebkitMaskImage: "linear-gradient(90deg, black 0%, black 38%, transparent 68%)",
          maskImage: "linear-gradient(90deg, black 0%, black 38%, transparent 68%)",
        }}
      />

      <div className="container-luxe relative z-10 grid gap-12 pt-28 pb-16 lg:grid-cols-2 lg:items-center lg:gap-8 lg:pt-32 lg:pb-20">
        <div className="max-w-xl flex flex-col items-start text-left">
          <Reveal className="self-start">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] shadow-[0_8px_24px_-12px_rgba(200,161,92,0.7)] backdrop-blur-sm transition-colors duration-700 ${
                isNight
                  ? "border-gold-400/50 bg-gold-400/10 text-gold-200"
                  : "border-gold-400 bg-gradient-to-r from-gold-50 to-gold-100 text-gold-900"
              }`}
            >
              <MotionIcon preset="pulse" loop>
                <WeatherGlyph size={16} />
              </MotionIcon>
              {weatherLine}
            </span>
          </Reveal>

          <div className="mt-4 self-start">
            <BrandKicker isNight={isNight} />
          </div>

          <Reveal delay={0.1} className="self-start">
            <h1
              className={`mt-3 font-display text-5xl leading-[1.05] tracking-tight transition-colors duration-700 sm:text-6xl md:text-7xl ${
                isNight ? "text-ivory-50" : "text-forest-950"
              }`}
            >
              Ooty,
              <br />
              Curated in <HeroWordCycle />
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p
              className={`mt-6 max-w-lg text-lg leading-relaxed transition-colors duration-700 ${
                isNight ? "text-forest-200" : "text-charcoal-500"
              }`}
            >
              Signature holiday packages across Ooty, Coonoor and Kotagiri —
              tea gardens, waterfalls, wildlife and viewpoints, woven into an
              itinerary built around how you want to travel.
            </p>
          </Reveal>

          <RevealGroup className="mt-8 grid grid-cols-3 gap-2 sm:gap-3" stagger={0.12}>
            {HIGHLIGHTS.map(({ icon: Icon, title, copy }) => (
              <RevealItem key={title}>
                <div
                  className={`group h-full min-w-0 rounded-xl border p-2.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 sm:rounded-2xl sm:p-4 ${
                    isNight
                      ? "border-ivory-50/15 bg-ivory-50/[0.04] hover:border-gold-400/40"
                      : "border-forest-100 bg-white/60 hover:border-gold-400/60 hover:bg-white"
                  }`}
                >
                  <span className="inline-flex text-gold-600">
                    <Icon size={18} className="sm:hidden" />
                    <Icon size={22} className="hidden sm:inline" />
                  </span>
                  <p
                    className={`mt-1.5 text-[11px] font-semibold leading-tight transition-colors duration-700 sm:mt-2 sm:text-sm ${
                      isNight ? "text-ivory-50" : "text-forest-950"
                    }`}
                  >
                    {title}
                  </p>
                  <p
                    className={`mt-1 hidden text-xs leading-relaxed sm:block ${
                      isNight ? "text-forest-300" : "text-charcoal-500"
                    }`}
                  >
                    {copy}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.3}>
            <div className="mt-9 flex gap-3 sm:flex-wrap sm:gap-4">
              <LinkButton href="/booking" variant="gold" className="flex-1 sm:flex-none">
                Plan Your Journey
              </LinkButton>
              <LinkButton href="/packages" variant="outline" className="flex-1 sm:flex-none">
                Explore Packages
              </LinkButton>
            </div>
          </Reveal>
        </div>

        <div className="relative lg:pl-4">
          <div
            className="pointer-events-none absolute -inset-6 -z-10 animate-glow-pulse rounded-[3rem] opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(60% 60% at 70% 20%, rgba(200,161,92,0.35), transparent), radial-gradient(50% 50% at 20% 80%, rgba(47,138,110,0.25), transparent)",
            }}
            aria-hidden
          />
          <PlanJourneyForm compact destinations={destinations} packages={packages} />
        </div>
      </div>

      <div className={`absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 transition-colors duration-700 sm:block ${isNight ? "text-ivory-200" : "text-forest-700"}`}>
        <MotionIcon preset="bounce" loop>
          <ChevronDown size={22} />
        </MotionIcon>
      </div>
    </section>
  );
}
