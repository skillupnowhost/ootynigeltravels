"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface SlideImage {
  src: string;
  alt: string;
}

const AUTOPLAY_MS = 4200;
const SWIPE_THRESHOLD = 40;

export function CardSlideshow({
  images,
  onImageClick,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className = "",
}: {
  images: SlideImage[];
  onImageClick?: (index: number) => void;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [images.length, paused]);

  if (images.length === 0) {
    return <div className={`relative overflow-hidden bg-forest-100 ${className}`} />;
  }

  function go(delta: 1 | -1) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  function onPointerDown(e: React.PointerEvent) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointerStart.current) return;
    if (Math.abs(e.clientX - pointerStart.current.x) > 8) dragged.current = true;
  }

  function onPointerUp(e: React.PointerEvent) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      go(dx < 0 ? 1 : -1);
      return;
    }
    if (!dragged.current) onImageClick?.(index);
  }

  const current = images[index];

  return (
    <div
      className={`group/slideshow relative overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 cursor-pointer"
        >
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes={sizes}
            priority={priority && index === 0}
            className="scale-105 select-none object-cover transition-transform duration-700 group-hover/slideshow:scale-[1.12]"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-forest-950/40 text-ivory-50 opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-forest-950/70 group-hover/slideshow:opacity-100 sm:h-10 sm:w-10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-forest-950/40 text-ivory-50 opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-forest-950/70 group-hover/slideshow:opacity-100 sm:h-10 sm:w-10"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                aria-label={`Show photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-5 bg-ivory-50" : "w-1.5 bg-ivory-50/50 hover:bg-ivory-50/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
