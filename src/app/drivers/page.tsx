import type { Metadata } from "next";
import { Languages, User } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";
import { listDrivers } from "@/lib/db/queries/drivers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meet Our Drivers",
  description: "The chauffeurs behind every booking — background-verified, ghat-road experienced.",
  alternates: { canonical: "/drivers" },
};

export default async function DriversPage() {
  const drivers = await listDrivers({ activeOnly: true });

  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title="Meet our drivers"
        description="Every chauffeur on our roster carries a minimum of five years' experience on Nilgiri ghat roads."
        seed="drivers-hero"
        variant="mountains"
      />

      <section className="container-luxe py-20">
        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {drivers.map((d) => (
            <RevealItem
              key={d.slug}
              className="group rounded-3xl border border-forest-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-200 hover:shadow-[0_28px_60px_-30px_rgba(11,59,46,0.35)]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-700 transition-colors duration-300 group-hover:bg-forest-900 group-hover:text-gold-400">
                <MotionIcon preset="tilt">
                  <User size={28} />
                </MotionIcon>
              </span>
              <h2 className="mt-4 font-display text-lg text-forest-950">{d.name}</h2>
              <div className="mt-2 flex items-center gap-1 text-sm text-gold-600">
                <GlowStarIcon size={16} />
                {d.rating.toFixed(1)}
                <span className="text-charcoal-500"> · {d.experience_years} yrs experience</span>
              </div>
              {d.bio && <p className="mt-3 text-sm leading-relaxed text-charcoal-500">{d.bio}</p>}
              {d.languages.length > 0 && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-charcoal-500">
                  <MotionIcon preset="wiggle">
                    <Languages size={14} />
                  </MotionIcon>
                  {d.languages.join(", ")}
                </div>
              )}
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
