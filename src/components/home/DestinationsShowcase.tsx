import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import type { Destination } from "@/lib/db/types";

export function DestinationsShowcase({ destinations }: { destinations: Destination[] }) {
  return (
    <section className="bg-forest-50 py-24">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Where to explore"
            title="Essential Ooty & Nilgiris destinations"
            description="Each stop sequenced into our signature packages — pick one as your base, or circuit through several."
          />
          <Link
            href="/destinations"
            className="group/link mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-900 hover:text-gold-700"
          >
            View all destinations{" "}
            <MotionIcon preset="bounce">
              <ArrowRight size={16} />
            </MotionIcon>
          </Link>
        </div>

        <RevealGroup className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {destinations.slice(0, 9).map((d) => (
            <RevealItem key={d.slug}>
              <Link
                href={`/destinations/${d.slug}`}
                className="group block overflow-hidden rounded-3xl border border-forest-100 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-300 hover:shadow-[0_32px_70px_-30px_rgba(11,59,46,0.4)]"
              >
                <div className="relative h-56 overflow-hidden sm:h-60">
                  {d.image ? (
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="scale-105 object-cover transition-transform duration-700 group-hover:scale-[1.15]"
                    />
                  ) : (
                    <ScenicArt
                      seed={d.slug}
                      className="h-full w-full scale-105 transition-transform duration-700 group-hover:scale-[1.15]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-medium text-ivory-50">
                    <MapPinDropIcon size={15} loop={false} /> {d.distance_from_ooty} from Ooty
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-forest-950 transition-colors group-hover:text-gold-700">{d.name}</h3>
                  <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-charcoal-500">{d.description}</p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
