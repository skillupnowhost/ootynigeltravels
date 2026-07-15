import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { CompassIcon, MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import { destinationsRepo } from "@/lib/db/queries/destinations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Six essential Nilgiri destinations — Ooty, Coonoor, Kotagiri, Mudumalai, Avalanche and Coimbatore.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const destinations = await destinationsRepo.list(true);

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Every essential stop in the Nilgiris"
        description="Booked as standalone transfers, or sequenced together into one of our signature circuits."
        seed="destinations-hero"
        variant="lake"
      />

      <section className="container-luxe py-20">
        <Reveal>
          <div className="flex items-center gap-2.5 text-sm font-medium text-charcoal-500">
            <CompassIcon size={20} className="text-gold-600" />
            Tap any stop for highlights, seasons, and route options
          </div>
        </Reveal>

        <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {destinations.map((d) => (
            <RevealItem key={d.slug}>
              <Link
                href={`/destinations/${d.slug}`}
                className="group block overflow-hidden rounded-3xl border border-forest-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-30px_rgba(11,59,46,0.35)]"
              >
                <div className="relative h-48 overflow-hidden">
                  {d.image ? (
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="scale-105 object-cover transition-transform duration-700 group-hover:scale-[1.15]"
                    />
                  ) : (
                    <ScenicArt seed={d.slug} className="h-full w-full scale-105 transition-transform duration-700 group-hover:scale-[1.15]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-forest-950/5 to-transparent transition-opacity duration-300 group-hover:from-forest-950/75" />
                  <span className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-medium text-ivory-50">
                    <MapPinDropIcon size={16} loop={false} /> {d.distance_from_ooty} from Ooty
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="font-display text-lg text-forest-950 transition-colors group-hover:text-gold-700">{d.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-charcoal-500">{d.description}</p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
