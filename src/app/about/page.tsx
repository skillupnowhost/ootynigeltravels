import type { Metadata } from "next";
import { Award } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { ShieldBadgeIcon, HeartBeatIcon, MapPinDropIcon, CarDriveIcon, CalendarCheckIcon } from "@/components/ui/AnimatedIcons";
import { site } from "@/lib/config/site";

const highlights = [
  { render: () => <CarDriveIcon size={20} />, label: "Private, chauffeur-driven — never shared" },
  { render: () => <MapPinDropIcon size={20} />, label: "Locally based in Ooty, not an aggregator" },
  { render: () => <CalendarCheckIcon size={20} />, label: "Itineraries built around your dates" },
  { render: () => <Award size={20} />, label: "Every vehicle inspected before pickup" },
];

export const metadata: Metadata = {
  title: "About Us",
  description: `The story behind ${site.name} — the best-rated private, chauffeur-driven travel agency across Ooty, Coimbatore and the Nilgiris.`,
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
              just a vehicle. That premise grew into a full fleet and a roster of
              signature circuits, but the core hasn&apos;t changed. Every booking still
              gets a private, chauffeur-driven vehicle — never a shared one — and an
              itinerary shaped around your dates, not a fixed departure calendar.
            </p>
            <p className="mt-4 text-base leading-relaxed text-charcoal-700">
              Today we coordinate everything from solo airport transfers to
              multi-vehicle corporate retreats, but we&apos;re still a Nilgiris-based
              team first — every route recommendation comes from someone who has
              actually driven it.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <RevealGroup className="grid grid-cols-1 gap-5 rounded-3xl border border-forest-100 bg-forest-50 p-6 sm:grid-cols-2 sm:p-8" stagger={0.08}>
              {highlights.map((h) => (
                <RevealItem key={h.label} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-gold-400">
                    {h.render()}
                  </span>
                  <p className="pt-2 text-sm leading-snug text-charcoal-700">{h.label}</p>
                </RevealItem>
              ))}
            </RevealGroup>
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
