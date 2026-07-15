"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";
import type { Review } from "@/lib/db/types";

const AVATAR_TONES = ["#123f31", "#a67c34", "#1b5744", "#6e5220", "#24705a"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function toneFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function TestimonialSlider({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reviews.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 5500);
    return () => clearInterval(t);
  }, [paused, reviews.length]);

  if (reviews.length === 0) return null;

  const r = reviews[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mx-auto max-w-3xl"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-white/85 p-8 shadow-[0_30px_70px_-32px_rgba(11,59,46,0.35)] backdrop-blur-md sm:p-12">
        <Quote className="absolute right-8 top-8 text-forest-100" size={64} strokeWidth={1} aria-hidden />

        <AnimatePresence mode="wait">
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="flex gap-0.5 text-gold-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <GlowStarIcon key={i} size={16} loop={false} className={i < r.rating ? "opacity-100" : "opacity-25"} />
              ))}
            </div>
            <p className="mt-5 max-w-xl font-display text-lg leading-relaxed text-forest-950 sm:text-xl">
              &ldquo;{r.comment}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-ivory-50"
                style={{ backgroundColor: toneFor(r.customer_name) }}
              >
                {initials(r.customer_name)}
              </span>
              <div>
                <p className="text-sm font-semibold text-forest-950">{r.customer_name}</p>
                <p className="text-xs text-charcoal-500">{r.source === "google" ? "Google Review" : "Verified traveller"}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {reviews.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + reviews.length) % reviews.length)}
            aria-label="Previous testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-200 text-forest-700 transition-colors hover:border-gold-400 hover:text-gold-700"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            {reviews.map((rv, i) => (
              <button
                key={rv.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? "22px" : "6px",
                  backgroundColor: i === index ? "#c8a15c" : "#e4eee9",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % reviews.length)}
            aria-label="Next testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-200 text-forest-700 transition-colors hover:border-gold-400 hover:text-gold-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
