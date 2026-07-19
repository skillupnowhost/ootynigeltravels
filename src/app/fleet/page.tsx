import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { CarDriveIcon, SparkleBurstIcon } from "@/components/ui/AnimatedIcons";
import { CarMedia } from "@/components/fleet/CarMedia";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Fleet",
  description: "A hand-picked fleet of chauffeur-driven vehicles for the Nilgiris — from a luxury SUV to an economy sedan.",
  alternates: { canonical: "/fleet" },
};

export default async function FleetPage() {
  const fleet = await fleetRepo.list(true);

  return (
    <>
      <PageHero
        eyebrow="The Fleet"
        title="A vehicle for every kind of journey"
        description="Every vehicle is inspected before it's assigned to you, and driven by a chauffeur who knows the ghat roads well."
        seed="fleet-hero"
        variant="mountains"
      />

      <section className="container-luxe py-20">
        <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {fleet.map((v) => (
            <RevealItem key={v.slug}>
              <Link
                href={`/fleet/${v.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-200 hover:shadow-[0_28px_60px_-30px_rgba(11,59,46,0.35)]"
              >
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-forest-50 to-forest-100">
                  <div className="road-texture absolute inset-x-0 bottom-6 h-px opacity-30" />
                  {v.model_kind === "photo" && v.hero_asset ? (
                    <div className="relative h-full w-full p-6">
                      <CarMedia
                        src={v.hero_asset}
                        alt={v.name}
                        interactive
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  ) : v.model_kind === "3d" ? (
                    <div className="flex flex-col items-center gap-2 text-forest-700">
                      <SparkleBurstIcon size={40} />
                      <span className="text-xs font-semibold uppercase tracking-widest">
                        Interactive 3D on homepage
                      </span>
                    </div>
                  ) : (
                    <CarDriveIcon
                      size={72}
                      className="text-forest-300 transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <span className="absolute right-4 top-4 rounded-full bg-forest-900/90 px-3 py-1 text-xs font-semibold text-ivory-50">
                    {v.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl text-forest-950">{v.name}</h2>
                  <div className="mt-2 flex items-center gap-4 text-xs text-charcoal-500">
                    <span className="inline-flex items-center gap-1">
                      <MotionIcon preset="bounce">
                        <Users size={14} />
                      </MotionIcon>
                      {v.seats} seats
                    </span>
                    {v.luggage && <span>{v.luggage} luggage</span>}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="font-display text-lg text-forest-950">
                      {formatINR(v.price_per_day)}
                      <span className="text-xs font-sans text-charcoal-500"> /day</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 transition-colors group-hover:underline">
                      Details
                    </span>
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
