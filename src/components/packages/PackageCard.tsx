import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Users, Wand2, Eye } from "lucide-react";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { LinkButton } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { ClockHandsIcon } from "@/components/ui/AnimatedIcons";
import { WishlistButton } from "@/components/packages/WishlistButton";
import { ShareButton } from "@/components/packages/ShareButton";
import { tripCategoryMeta } from "@/lib/config/tripCategories";
import { formatINR } from "@/lib/format";
import type { TourPackage } from "@/lib/db/types";

export function PackageCard({ pkg }: { pkg: TourPackage }) {
  const hero = pkg.gallery[0] ?? pkg.hero_image;
  const hasDiscount = pkg.original_price != null && pkg.original_price > pkg.price_from;
  const discountPct = hasDiscount
    ? Math.round((1 - pkg.price_from / (pkg.original_price as number)) * 100)
    : 0;
  const category = tripCategoryMeta(pkg.category);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest-100 bg-white transition-all duration-500 hover:-translate-y-2 hover:border-gold-200 hover:shadow-[0_32px_70px_-30px_rgba(11,59,46,0.4)]">
      <Link href={`/packages/${pkg.slug}`} className="relative block h-48 overflow-hidden">
        {hero ? (
          <Image
            src={hero}
            alt={pkg.name}
            fill
            sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <ScenicArt seed={pkg.slug} className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-forest-950/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-forest-950/75 px-2.5 py-1 text-xs font-semibold text-ivory-50 backdrop-blur">
          <MotionIcon preset="pulse">
            <Star size={12} className="fill-gold-400 text-gold-400" />
          </MotionIcon>
          {pkg.rating.toFixed(1)}
          <span className="text-forest-200">({pkg.review_count})</span>
        </span>

        {hasDiscount && (
          <span className="animate-shimmer absolute right-3 top-3 rounded-full bg-gold-600 px-2.5 py-1 text-xs font-bold text-forest-950">
            {discountPct}% OFF
          </span>
        )}

        {category && (
          <span
            title={category.label}
            className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-forest-800 shadow-[0_6px_16px_-6px_rgba(11,59,46,0.5)] backdrop-blur transition-transform duration-500 group-hover:scale-110"
          >
            {category.icon(15)}
          </span>
        )}

        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory-50/95 px-4 py-2 text-xs font-semibold text-forest-900 shadow-lg">
            <Eye size={14} />
            Quick view
          </span>
        </span>

        {pkg.highlights.length > 0 && (
          <div className="absolute inset-x-3 bottom-3 flex translate-y-2 flex-wrap gap-1.5 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
            {pkg.highlights.slice(0, 2).map((h) => (
              <span
                key={h}
                className="rounded-full bg-forest-950/70 px-2.5 py-1 text-[11px] font-medium text-ivory-100 backdrop-blur"
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          {pkg.duration_label && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-xs font-medium text-forest-800">
              <ClockHandsIcon size={13} loop={false} /> {pkg.duration_label}
            </span>
          )}
          {pkg.max_group_size && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-xs font-medium text-forest-800">
              <MotionIcon preset="tilt">
                <Users size={13} />
              </MotionIcon>
              Up to {pkg.max_group_size}
            </span>
          )}
        </div>

        <Link href={`/packages/${pkg.slug}`}>
          <h3 className="mt-4 font-display text-xl text-forest-950 transition-colors group-hover:text-forest-700">
            {pkg.name}
          </h3>
        </Link>
        {pkg.summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-charcoal-500">{pkg.summary}</p>}

        {pkg.vehicle_options.length > 0 && (
          <p className="mt-3 text-xs text-charcoal-500">{pkg.vehicle_options.join(" · ")}</p>
        )}

        <div className="mt-auto pt-6">
          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-sm text-charcoal-400 line-through">{formatINR(pkg.original_price as number)}</span>
            )}
            <span className="font-display text-lg text-forest-950">{formatINR(pkg.price_from)}</span>
            <span className="text-xs text-charcoal-500">/ person</span>
          </div>

          <div className="mt-4 flex gap-2">
            <LinkButton href={`/packages/${pkg.slug}`} variant="outline" icon={false} className="flex-1 justify-center !px-3 !py-2.5 text-xs">
              View Details
            </LinkButton>
            <LinkButton href={`/booking?package=${pkg.slug}`} variant="gold" icon={false} className="flex-1 justify-center !px-3 !py-2.5 text-xs">
              Book Now
            </LinkButton>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <Link
              href={`/packages/customize?package=${pkg.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:underline"
            >
              <MotionIcon preset="wiggle">
                <Wand2 size={14} />
              </MotionIcon>
              Customize
              <MotionIcon preset="bounce">
                <ArrowRight size={12} />
              </MotionIcon>
            </Link>
            <div className="flex gap-1.5">
              <WishlistButton slug={pkg.slug} className="!h-8 !w-8" />
              <ShareButton title={pkg.name} text={pkg.tagline ?? undefined} url={`/packages/${pkg.slug}`} className="!h-8 !w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
