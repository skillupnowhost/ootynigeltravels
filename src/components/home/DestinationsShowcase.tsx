import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { DestinationCard } from "@/components/home/DestinationCard";
import type { Destination } from "@/lib/db/types";
import type { SlideImage } from "@/components/home/CardSlideshow";

export interface DestinationWithImages extends Destination {
  images: SlideImage[];
}

export function DestinationsShowcase({ destinations }: { destinations: DestinationWithImages[] }) {
  return (
    <section id="destinations" className="bg-forest-50 py-24">
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
          {destinations.slice(0, 9).map((d, i) => (
            <RevealItem key={d.slug}>
              <DestinationCard
                slug={d.slug}
                name={d.name}
                description={d.description}
                distanceFromOoty={d.distance_from_ooty}
                images={d.images}
                priority={i === 0}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
