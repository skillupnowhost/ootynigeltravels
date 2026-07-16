"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { BLUR_DATA_URL } from "@/lib/media";
import {
  FamilyGroupIcon,
  HeartBeatIcon,
  MountainSunIcon,
  FriendsGroupIcon,
  SparkleBurstIcon,
} from "@/components/ui/AnimatedIcons";

const ease = [0.22, 1, 0.36, 1] as const;

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const step = maxScroll / (TRIP_STYLES.length - 1);
    setActiveDot(Math.round(el.scrollLeft / step));
  }

  function scrollToCard(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const step = maxScroll / (TRIP_STYLES.length - 1);
    el.scrollTo({ left: step * index, behavior: "smooth" });
  }

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
            className="group mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 hover:text-gold-300"
          >
            Browse all packages{" "}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <motion.div
          ref={scrollerRef}
          onScroll={handleScroll}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="scrollbar-hide -mx-4 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 sm:[mask-image:none] md:grid-cols-3 xl:grid-cols-5"
        >
          {TRIP_STYLES.map((c) => (
            <motion.div key={c.key} variants={itemVariants} className="w-[72%] shrink-0 snap-center sm:w-auto sm:shrink">
              <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-forest-800 bg-forest-900 transition-all duration-500 hover:-translate-y-2 hover:border-gold-500 hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.5)]">
                <Link href={c.href} className="relative block h-40 overflow-hidden sm:h-36">
                  <Image
                    src={c.image}
                    alt={c.label}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 72vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-transparent" />
                  <span className="animate-bob absolute bottom-3 left-4 flex h-9 w-9 items-center justify-center rounded-xl bg-forest-950/80 text-gold-400 backdrop-blur transition-transform duration-500 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-forest-950">
                    {c.icon(18)}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <Link href={c.href}>
                    <h3 className="font-display text-lg text-ivory-50 transition-colors group-hover:text-gold-200">
                      {c.label}
                    </h3>
                  </Link>
                  <p className="mt-2 text-xs leading-relaxed text-forest-300">{c.blurb}</p>

                  <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
                    <Link
                      href={c.href}
                      className="relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full border border-gold-500/50 bg-gold-500/10 px-3 py-2 text-xs font-semibold text-gold-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-500 hover:text-forest-950 hover:shadow-[0_10px_28px_-8px_rgba(200,161,92,0.6)] active:translate-y-0 active:scale-95"
                    >
                      <span className="animate-glow-pulse pointer-events-none absolute inset-0 rounded-full bg-gold-500/20 group-hover:hidden" aria-hidden />
                      Explore
                      <MotionIcon preset="bounce">
                        <ArrowRight size={13} />
                      </MotionIcon>
                    </Link>
                    <Link
                      href="/booking"
                      className="inline-flex items-center justify-center rounded-full bg-gold-600 px-3 py-2 text-xs font-semibold text-forest-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-500 hover:shadow-[0_10px_28px_-8px_rgba(200,161,92,0.6)] active:translate-y-0 active:scale-95"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-5 flex items-center justify-center gap-2 sm:hidden">
          {TRIP_STYLES.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onClick={() => scrollToCard(i)}
              aria-label={`Go to ${c.label}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeDot ? "w-6 bg-gold-400" : "w-1.5 bg-forest-700"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
