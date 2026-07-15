"use client";

import { useState } from "react";
import Link from "next/link";
import { CardSlideshow, type SlideImage } from "./CardSlideshow";
import { CardLightbox } from "./CardLightbox";
import { ExploreButton } from "./ExploreButton";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { MapPinDropIcon } from "@/components/ui/AnimatedIcons";

export function DestinationCard({
  slug,
  name,
  description,
  distanceFromOoty,
  images,
  priority = false,
}: {
  slug: string;
  name: string;
  description: string | null;
  distanceFromOoty: string | null;
  images: SlideImage[];
  priority?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="group block overflow-hidden rounded-3xl border border-forest-100 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-300 hover:shadow-[0_32px_70px_-30px_rgba(11,59,46,0.4)]">
        <div className="relative h-56 overflow-hidden sm:h-60">
          {images.length > 0 ? (
            <CardSlideshow images={images} onImageClick={setOpenIndex} priority={priority} className="h-full w-full" />
          ) : (
            <Link href={`/destinations/${slug}`} className="block h-full w-full">
              <ScenicArt seed={slug} className="h-full w-full scale-105 transition-transform duration-700 group-hover:scale-[1.15]" />
            </Link>
          )}
          {distanceFromOoty && (
            <span className="pointer-events-none absolute bottom-3 left-4 z-10 flex items-center gap-1.5 text-xs font-medium text-ivory-50">
              <MapPinDropIcon size={15} loop={false} /> {distanceFromOoty} from Ooty
            </span>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/destinations/${slug}`} className="min-w-0">
              <h3 className="font-display text-xl text-forest-950 transition-colors hover:text-gold-700">{name}</h3>
            </Link>
            <ExploreButton placeName={name} className="mt-0.5 shrink-0" />
          </div>
          {description && <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-charcoal-500">{description}</p>}
        </div>
      </div>

      <CardLightbox title={name} images={images} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}
