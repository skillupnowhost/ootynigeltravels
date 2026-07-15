"use client";

import { useState } from "react";
import { CardSlideshow, type SlideImage } from "./CardSlideshow";
import { CardLightbox } from "./CardLightbox";
import { ExploreButton } from "./ExploreButton";

export function HiddenGemCard({
  name,
  category,
  blurb,
  images,
}: {
  name: string;
  category: string;
  blurb: string | null;
  images: SlideImage[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-forest-100 bg-forest-950 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-400 hover:shadow-[0_24px_50px_-24px_rgba(11,59,46,0.45)] sm:rounded-3xl">
        <CardSlideshow
          images={images}
          onImageClick={setOpenIndex}
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 32vw, 48vw"
          className="h-full w-full opacity-90"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/92 via-forest-950/25 to-transparent transition-opacity duration-500 group-hover:from-forest-950/95" />
        <span className="pointer-events-none absolute left-3 top-3 max-w-[55%] truncate rounded-full bg-ivory-50/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-forest-800 backdrop-blur-sm sm:left-4 sm:top-4">
          {category}
        </span>
        <ExploreButton placeName={name} className="absolute right-3 top-3 z-10 shrink-0 sm:right-4 sm:top-4" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 p-4 transition-transform duration-500 group-hover:translate-y-0 sm:p-5">
          <h3 className="font-display text-base leading-tight text-ivory-50 sm:text-lg">{name}</h3>
          {blurb && (
            <p className="mt-1.5 line-clamp-2 max-h-0 overflow-hidden text-xs leading-relaxed text-forest-200 opacity-0 transition-all duration-500 group-hover:max-h-12 group-hover:opacity-100 sm:max-h-12 sm:opacity-100">
              {blurb}
            </p>
          )}
        </div>
      </div>

      <CardLightbox title={name} images={images} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}
