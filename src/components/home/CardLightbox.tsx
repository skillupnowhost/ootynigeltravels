"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Minimize } from "lucide-react";
import type { SlideImage } from "./CardSlideshow";

export function CardLightbox({
  title,
  images,
  openIndex,
  onClose,
}: {
  title: string;
  images: SlideImage[];
  openIndex: number | null;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(openIndex ?? 0);
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const pointerStart = useRef<{ x: number } | null>(null);

  // Sync index/zoom to the opened photo — adjusted during render (per React's
  // "you might not need an effect" guidance) rather than in a useEffect.
  const [lastOpenIndex, setLastOpenIndex] = useState(openIndex);
  if (openIndex !== lastOpenIndex) {
    setLastOpenIndex(openIndex);
    if (openIndex !== null) {
      setIndex(openIndex);
      if (zoomed) setZoomed(false);
    }
  }

  useEffect(() => {
    if (openIndex === null) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, images.length, onClose]);

  useEffect(() => {
    function onFsChange() {
      setFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  if (openIndex === null) return null;
  const image = images[index];
  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[100] flex flex-col bg-forest-950/97 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6" onClick={(e) => e.stopPropagation()}>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">{title}</p>
            <p className="text-xs text-forest-300">
              {index + 1} / {images.length}
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LightboxButton onClick={() => setZoomed((v) => !v)} label={zoomed ? "Zoom out" : "Zoom in"}>
              {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </LightboxButton>
            <LightboxButton onClick={toggleFullscreen} label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </LightboxButton>
            <LightboxButton onClick={onClose} label="Close">
              <X size={20} />
            </LightboxButton>
          </div>
        </div>

        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden px-2"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            pointerStart.current = { x: e.clientX };
          }}
          onPointerUp={(e) => {
            const start = pointerStart.current;
            pointerStart.current = null;
            if (!start) return;
            const dx = e.clientX - start.x;
            if (Math.abs(dx) > 50) setIndex((i) => (i + (dx < 0 ? 1 : -1) + images.length) % images.length);
          }}
        >
          {images.length > 1 && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => (i - 1 + images.length) % images.length);
              }}
              aria-label="Previous photo"
              className="absolute left-2 z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-ivory-50 transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <motion.div
            key={image.src}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: zoomed ? 2 : 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`relative h-[62vh] w-[88vw] sm:h-[75vh] sm:w-[80vw] ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((v) => !v);
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="90vw"
              className="pointer-events-none select-none rounded-xl object-contain"
              priority
            />
          </motion.div>

          {images.length > 1 && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => (i + 1) % images.length);
              }}
              aria-label="Next photo"
              className="absolute right-2 z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-ivory-50 transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        <div className="mx-auto mb-6 max-w-xl px-6 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs text-forest-300">{image.alt}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function LightboxButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-ivory-50 transition-colors hover:bg-white/20"
    >
      {children}
    </button>
  );
}
