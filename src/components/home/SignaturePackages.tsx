import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { ClockHandsIcon } from "@/components/ui/AnimatedIcons";
import { formatINR } from "@/lib/format";
import { BLUR_DATA_URL } from "@/lib/media";
import type { TourPackage } from "@/lib/db/types";

export function SignaturePackages({ packages }: { packages: TourPackage[] }) {
  return (
    <section className="bg-forest-950 py-24 text-ivory-50">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              <span className="h-px w-8 bg-gold-500" aria-hidden />
              Signature packages
            </span>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ivory-50 sm:text-4xl md:text-5xl">
              Itineraries built around how an Ooty holiday actually feels
            </h2>
          </div>
          <Link
            href="/packages"
            className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 hover:text-gold-300"
          >
            View all packages{" "}
            <MotionIcon preset="bounce">
              <ArrowRight size={16} />
            </MotionIcon>
          </Link>
        </div>

        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.12}>
          {packages.slice(0, 6).map((p) => {
            const hero = p.gallery[0] ?? p.hero_image;
            return (
            <RevealItem key={p.slug}>
              <Link
                href={`/packages/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest-800 bg-forest-900 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-500 hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.5)]"
              >
                <div className="relative h-44 overflow-hidden">
                  {hero ? (
                    <Image
                      src={hero}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <ScenicArt seed={p.slug} className="h-full w-full transition-transform duration-700 group-hover:scale-110" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/10 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-forest-800 px-3 py-1 text-xs font-medium text-gold-300">
                    <ClockHandsIcon size={14} loop={false} /> {p.duration_label}
                  </span>
                  <h3 className="mt-4 font-display text-xl text-ivory-50">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-300">{p.tagline}</p>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span>
                      <span className="text-xs text-forest-400">From</span>
                      <span className="ml-1.5 font-display text-lg text-gold-400">
                        {formatINR(p.price_from)}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold-500/40 px-3.5 py-1.5 text-xs font-semibold text-ivory-50 transition-all duration-300 group-hover:border-gold-400 group-hover:bg-gold-500/10 group-hover:text-gold-300">
                      View Details
                      <MotionIcon preset="bounce">
                        <ArrowRight size={13} />
                      </MotionIcon>
                    </span>
                  </div>
                </div>
              </Link>
            </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
