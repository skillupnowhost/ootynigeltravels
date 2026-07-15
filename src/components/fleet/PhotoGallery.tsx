"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { CarMedia } from "./CarMedia";

export function PhotoGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(-1);

  function goTo(i: number) {
    setDirection(i > active ? 1 : i < active ? -1 : direction);
    setActive(i);
  }

  return (
    <div>
      <div className="group relative h-80 overflow-hidden rounded-3xl bg-gradient-to-br from-forest-50 to-forest-100 sm:h-[420px]">
        <div className="road-texture absolute inset-x-0 bottom-10 h-[2px] opacity-40" />

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: direction >= 0 ? 70 : -70, filter: "blur(5px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: direction >= 0 ? -70 : 70, filter: "blur(5px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 p-8"
          >
            <CarMedia
              src={images[active]}
              alt={`${alt} — view ${active + 1}`}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              imageClassName="transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          <motion.div
            key={`speed-${active}`}
            className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent"
                style={{ width: "55%", marginLeft: direction >= 0 ? "45%" : "0%" }}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active === 0 ? images.length - 1 : active - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-forest-950/70 p-2 text-ivory-50 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100"
            >
              <MotionIcon preset="tilt">
                <ChevronLeft size={18} />
              </MotionIcon>
            </button>
            <button
              type="button"
              onClick={() => goTo(active === images.length - 1 ? 0 : active + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-forest-950/70 p-2 text-ivory-50 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100"
            >
              <MotionIcon preset="tilt">
                <ChevronRight size={18} />
              </MotionIcon>
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => goTo(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-forest-50 transition-all duration-300 hover:scale-105 ${
                i === active ? "border-gold-600 shadow-[0_4px_16px_-4px_rgba(200,161,92,0.5)]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill className="object-contain p-1" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
