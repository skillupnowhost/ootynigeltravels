"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";
import type { Review } from "@/lib/db/types";

const ease = [0.22, 1, 0.36, 1] as const;
const AVATAR_TONES = ["#123f31", "#a67c34", "#1b5744", "#6e5220", "#24705a"];
const PAGE_SIZE = 3;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function toneFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

export function TestimonialSlider({ reviews }: { reviews: Review[] }) {
  const pages = useMemo(() => chunk(reviews, PAGE_SIZE), [reviews]);
  const [pageIndex, setPageIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || pages.length < 2) return;
    const t = setInterval(() => setPageIndex((i) => (i + 1) % pages.length), 7000);
    return () => clearInterval(t);
  }, [paused, pages.length]);

  if (reviews.length === 0) return null;

  const current = pages[pageIndex] ?? pages[0];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={pageIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {current.map((r) => (
            <TestimonialCard key={r.id} review={r} />
          ))}
        </motion.div>
      </AnimatePresence>

      {pages.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPageIndex((i) => (i - 1 + pages.length) % pages.length)}
            aria-label="Previous testimonials"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-200 text-forest-700 transition-colors hover:border-gold-400 hover:text-gold-700"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPageIndex(i)}
                aria-label={`Go to testimonials page ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === pageIndex ? "22px" : "6px",
                  backgroundColor: i === pageIndex ? "#c8a15c" : "#e4eee9",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPageIndex((i) => (i + 1) % pages.length)}
            aria-label="Next testimonials"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-200 text-forest-700 transition-colors hover:border-gold-400 hover:text-gold-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ review: r }: { review: Review }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-forest-100 bg-white/85 p-6 shadow-[0_24px_56px_-32px_rgba(11,59,46,0.3)] backdrop-blur-md">
      <Quote className="absolute right-5 top-5 text-forest-100" size={40} strokeWidth={1} aria-hidden />
      <div className="flex gap-0.5 text-gold-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <GlowStarIcon key={i} size={14} loop={i < r.rating} className={i < r.rating ? "opacity-100" : "opacity-25"} />
        ))}
      </div>
      <p className="relative mt-4 flex-1 text-sm leading-relaxed text-forest-950">&ldquo;{r.comment}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-ivory-50"
          style={{ backgroundColor: toneFor(r.customer_name) }}
        >
          {initials(r.customer_name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-forest-950">{r.customer_name}</p>
          <p className="text-xs text-charcoal-500">{r.source === "google" ? "Google Review" : "Verified traveller"}</p>
        </div>
      </div>
    </div>
  );
}
