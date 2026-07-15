import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import {
  FamilyGroupIcon,
  HeartBeatIcon,
  MountainSunIcon,
  FriendsGroupIcon,
  SparkleBurstIcon,
} from "@/components/ui/AnimatedIcons";

const TRIP_STYLES = [
  {
    key: "Family",
    label: "Family Trips",
    blurb: "Gentle pacing, easy-access sights, and something for every age.",
    image: "/images/trip-styles/Family.jpg",
    icon: (size = 20) => <FamilyGroupIcon size={size} />,
    href: "/packages?category=Family",
  },
  {
    key: "Honeymoon",
    label: "Couple Trips",
    blurb: "Golden-hour viewpoints, quiet lakesides, and unhurried mornings.",
    image: "/images/trip-styles/Honeymoon.jpg",
    icon: (size = 20) => <HeartBeatIcon size={size} />,
    href: "/packages?category=Honeymoon",
  },
  {
    key: "Adventure",
    label: "Adventure Trips",
    blurb: "Forest trails, jungle rides, and Ooty beyond the postcards.",
    image: "/images/trip-styles/Adventure.jpg",
    icon: (size = 20) => <MountainSunIcon size={size} />,
    href: "/packages?category=Adventure",
  },
  {
    key: "Friends",
    label: "Friends Trips",
    blurb: "Viewpoint-hopping, group photo stops, and a lively full-day loop.",
    image: "/images/trip-styles/Friends.jpg",
    icon: (size = 20) => <FriendsGroupIcon size={size} />,
    href: "/packages?category=Friends",
  },
  {
    key: "Customized",
    label: "Customized Trips",
    blurb: "Tell us the places, dates and pace — we'll design a plan just for you.",
    image: "/images/trip-styles/Customized.jpg",
    icon: (size = 20) => <SparkleBurstIcon size={size} />,
    href: "/packages/customize",
  },
];

export function TripStylesShowcase() {
  return (
    <section className="bg-forest-950 py-24 text-ivory-50">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              <span className="h-px w-8 bg-gold-500" aria-hidden />
              Trip packages &amp; plans
            </span>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] text-ivory-50 sm:text-4xl md:text-5xl">
              Choose Your Trip Style
            </h2>
            <p className="mt-5 max-w-xl text-base text-forest-200 sm:text-lg">
              Every plan includes a private chauffeur. Pick the style closest to your trip, or hand us
              the details and we&apos;ll build one from scratch.
            </p>
          </div>
          <Link
            href="/packages"
            className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 hover:text-gold-300"
          >
            Browse all packages{" "}
            <MotionIcon preset="bounce">
              <ArrowRight size={16} />
            </MotionIcon>
          </Link>
        </div>

        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5" stagger={0.1}>
          {TRIP_STYLES.map((c) => (
            <RevealItem key={c.key}>
              <Link
                href={c.href}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest-800 bg-forest-900 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-500 hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.5)]"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={c.image}
                    alt={c.label}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-transparent" />
                  <span className="absolute bottom-3 left-4 flex h-9 w-9 items-center justify-center rounded-xl bg-forest-950/80 text-gold-400 backdrop-blur">
                    {c.icon(18)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg text-ivory-50">{c.label}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-forest-300">{c.blurb}</p>
                  <span className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-xs font-semibold text-gold-400 transition-colors group-hover:text-gold-300">
                    <span className="rounded-full border border-gold-500/40 px-3 py-1.5 transition-all duration-300 group-hover:border-gold-400 group-hover:bg-gold-500/10">
                      Explore
                    </span>
                    <MotionIcon preset="bounce">
                      <ArrowRight size={13} />
                    </MotionIcon>
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
