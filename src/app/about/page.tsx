import type { Metadata } from "next";
import { Award } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { ShieldBadgeIcon, HeartBeatIcon, MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `The story behind ${site.name} — private, chauffeur-driven travel across the Nilgiris.`,
  alternates: { canonical: "/about" },
};

const values = [
  {
    render: () => <ShieldBadgeIcon size={24} />,
    title: "Safety first, always",
    description: "Every driver is background-verified with a minimum of 5 years on Nilgiri ghat roads.",
  },
  {
    render: () => <HeartBeatIcon size={22} />,
    title: "Unhurried by design",
    description: "No fixed group departures, no rushed itineraries — every trip is paced around you.",
  },
  {
    render: () => <MapPinDropIcon size={22} />,
    title: "Genuinely local",
    description: "We're based in Ooty, not a booking aggregator — every recommendation is first-hand.",
  },
  {
    render: () => (
      <MotionIcon preset="tilt" loop>
        <Award size={22} />
      </MotionIcon>
    ),
    title: "Fleet, inspected",
    description: "Vehicles are checked before every booking, not just at time of purchase.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={`The story behind ${site.name}`}
        description="A small, local team built around one idea — that a hill-station trip should feel unhurried from the moment you're picked up."
        seed="about-hero"
      />

      <section className="container-luxe py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="font-display text-3xl text-forest-950">
              We started with one chauffeur and a single sedan.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-charcoal-700">
              {site.name} began as a small, family-run taxi service in Ooty, built on a
              simple premise: travellers arriving in the Nilgiris deserve a driver who
              actually knows the roads, the seasons, and the quiet viewpoints — not
              just a vehicle. Over {site.stats.yearsExperience}+ years, that premise
              grew into a full fleet and a roster of signature circuits, but the core
              hasn&apos;t changed. Every booking still gets a private, chauffeur-driven
              vehicle — never a shared one — and an itinerary shaped around your dates,
              not a fixed departure calendar.
            </p>
            <p className="mt-4 text-base leading-relaxed text-charcoal-700">
              Today we coordinate everything from solo airport transfers to
              multi-vehicle corporate retreats, but we&apos;re still a Nilgiris-based
              team first — every route recommendation comes from someone who has
              actually driven it.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-1 gap-6 rounded-3xl border border-forest-100 bg-forest-50 p-6 sm:grid-cols-2 sm:p-8">
              <Stat value={site.stats.yearsExperience} suffix="+" label="Years on the road" />
              <Stat value={site.stats.happyTravellers} suffix="+" label="Happy travellers" />
              <Stat value={site.stats.toursCompleted} suffix="+" label="Tours completed" />
              <Stat value={site.stats.fleetSize} suffix="+" label="Vehicles in fleet" />
            </div>
          </Reveal>
        </div>

        <RevealGroup className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {values.map(({ render, title, description }) => (
            <RevealItem
              key={title}
              className="rounded-3xl border border-forest-100 bg-white p-7 transition-shadow hover:shadow-[0_24px_50px_-24px_rgba(11,59,46,0.25)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-gold-400">
                {render()}
              </span>
              <h3 className="mt-5 font-display text-lg text-forest-950">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-500">{description}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div>
      <Counter value={value} suffix={suffix} className="block font-display text-3xl text-forest-950" />
      <p className="mt-1 text-xs uppercase tracking-wide text-charcoal-500">{label}</p>
    </div>
  );
}
