"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { HiddenGemCard } from "@/components/home/HiddenGemCard";
import type { Attraction } from "@/lib/db/types";
import type { SlideImage } from "@/components/home/CardSlideshow";

const INITIAL_COUNT = 8;

export interface AttractionWithImages extends Attraction {
  images: SlideImage[];
}

export function AttractionsCarousel({ attractions }: { attractions: AttractionWithImages[] }) {
  const [expanded, setExpanded] = useState(false);
  const initial = attractions.slice(0, INITIAL_COUNT);
  const rest = attractions.slice(INITIAL_COUNT);

  return (
    <section id="hidden-gems" className="bg-ivory-50 py-24">
      <div className="container-luxe">
        <SectionHeading
          eyebrow={`${attractions.length} places, one journey`}
          title="Discover Ooty's Hidden Gems"
          description="Peaks, lakes, gardens and tea trails — the sights that make up our signature itineraries."
        />

        <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4" stagger={0.06}>
          {initial.map((a) => (
            <RevealItem key={a.slug}>
              <HiddenGemCard name={a.name} category={a.category} blurb={a.blurb} images={a.images} />
            </RevealItem>
          ))}
        </RevealGroup>

        {expanded && rest.length > 0 && (
          // A separate RevealGroup so these cards mount fresh and animate in
          // themselves — the group above already fired its whileInView once,
          // so children added to it later would stay stuck at opacity 0.
          <RevealGroup
            className="mt-4 grid grid-cols-2 gap-4 sm:mt-5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
            stagger={0.06}
          >
            {rest.map((a) => (
              <RevealItem key={a.slug}>
                <HiddenGemCard name={a.name} category={a.category} blurb={a.blurb} images={a.images} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        {attractions.length > INITIAL_COUNT && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="group inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-6 py-3 text-sm font-semibold text-forest-900 transition-all duration-300 hover:border-gold-500 hover:text-gold-700"
            >
              {expanded ? "Show fewer gems" : `Show all ${attractions.length} hidden gems`}
              <MotionIcon preset="bounce">
                <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
              </MotionIcon>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
