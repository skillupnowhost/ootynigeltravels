"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ATTRACTIONS } from "@/lib/config/attractions";

const INITIAL_COUNT = 8;

function AttractionCard({ a }: { a: (typeof ATTRACTIONS)[number] }) {
  return (
    <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-forest-100 bg-forest-950 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-400 hover:shadow-[0_24px_50px_-24px_rgba(11,59,46,0.45)] sm:rounded-3xl">
      <Image
        src={a.image}
        alt={a.name}
        fill
        sizes="(min-width: 1024px) 23vw, (min-width: 640px) 32vw, 48vw"
        className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/92 via-forest-950/25 to-transparent transition-opacity duration-500 group-hover:from-forest-950/95" />
      <span className="absolute left-3 top-3 rounded-full bg-ivory-50/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-forest-800 backdrop-blur-sm sm:left-4 sm:top-4">
        {a.category}
      </span>
      <div className="absolute inset-x-0 bottom-0 translate-y-1 p-4 transition-transform duration-500 group-hover:translate-y-0 sm:p-5">
        <h3 className="font-display text-base leading-tight text-ivory-50 sm:text-lg">{a.name}</h3>
        <p className="mt-1.5 line-clamp-2 max-h-0 overflow-hidden text-xs leading-relaxed text-forest-200 opacity-0 transition-all duration-500 group-hover:max-h-12 group-hover:opacity-100 sm:max-h-12 sm:opacity-100">
          {a.blurb}
        </p>
      </div>
    </div>
  );
}

export function AttractionsCarousel() {
  const [expanded, setExpanded] = useState(false);
  const initial = ATTRACTIONS.slice(0, INITIAL_COUNT);
  const rest = ATTRACTIONS.slice(INITIAL_COUNT);

  return (
    <section className="bg-ivory-50 py-24">
      <div className="container-luxe">
        <SectionHeading
          eyebrow={`${ATTRACTIONS.length} places, one journey`}
          title="Discover Ooty's Hidden Gems"
          description="Peaks, lakes, gardens and tea trails — the sights that make up our signature itineraries."
        />

        <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4" stagger={0.06}>
          {initial.map((a) => (
            <RevealItem key={a.slug}>
              <AttractionCard a={a} />
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
                <AttractionCard a={a} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        {ATTRACTIONS.length > INITIAL_COUNT && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="group inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-6 py-3 text-sm font-semibold text-forest-900 transition-all duration-300 hover:border-gold-500 hover:text-gold-700"
            >
              {expanded ? "Show fewer gems" : `Show all ${ATTRACTIONS.length} hidden gems`}
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
