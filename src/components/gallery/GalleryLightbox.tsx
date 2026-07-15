"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Minimize, Share2, Link2 } from "lucide-react";
import type { GalleryImage } from "@/lib/db/types";
import { galleryCategoryLabel } from "@/lib/data/galleryCategories";

export function GalleryLightbox({
  image,
  categoryImages,
  onClose,
  onNavigate,
}: {
  image: GalleryImage | null;
  categoryImages: GalleryImage[];
  onClose: () => void;
  onNavigate: (direction: 1 | -1) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastImageId, setLastImageId] = useState<number | null>(image?.id ?? null);

  // Reset zoom when the open photo changes — adjusted during render (per
  // React's "you might not need an effect" guidance) rather than in a useEffect.
  if ((image?.id ?? null) !== lastImageId) {
    setLastImageId(image?.id ?? null);
    if (zoomed) setZoomed(false);
  }

  useEffect(() => {
    if (!image) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(-1);
      if (e.key === "ArrowRight") onNavigate(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

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

  async function share() {
    if (!image) return;
    const url = `${window.location.origin}${window.location.pathname}?photo=${image.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: image.alt, url });
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const index = image ? categoryImages.findIndex((i) => i.id === image.id) : -1;

  return (
    <AnimatePresence>
      {image && (
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                {galleryCategoryLabel(image.category)}
              </p>
              <p className="text-xs text-forest-300">
                {index + 1} / {categoryImages.length}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <LightboxButton onClick={() => setZoomed((v) => !v)} label={zoomed ? "Zoom out" : "Zoom in"}>
                {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </LightboxButton>
              <LightboxButton onClick={toggleFullscreen} label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
                {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </LightboxButton>
              <LightboxButton onClick={share} label="Share">
                {copied ? <Link2 size={18} className="text-gold-400" /> : <Share2 size={18} />}
              </LightboxButton>
              <LightboxButton onClick={onClose} label="Close">
                <X size={20} />
              </LightboxButton>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2" onClick={(e) => e.stopPropagation()}>
            {categoryImages.length > 1 && (
              <button
                type="button"
                onClick={() => onNavigate(-1)}
                aria-label="Previous photo"
                className="absolute left-2 z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-ivory-50 transition-colors hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: zoomed ? 2 : 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              drag={zoomed}
              dragElastic={0.05}
              dragConstraints={{ left: -220, right: 220, top: -160, bottom: 160 }}
              className={`relative h-[62vh] w-[88vw] sm:h-[75vh] sm:w-[80vw] ${zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
              onClick={() => !zoomed && setZoomed(true)}
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

            {categoryImages.length > 1 && (
              <button
                type="button"
                onClick={() => onNavigate(1)}
                aria-label="Next photo"
                className="absolute right-2 z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-ivory-50 transition-colors hover:bg-white/20 sm:right-6"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>

          <div
            className="mx-auto mb-6 max-w-xl px-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {image.caption && <p className="font-display text-base text-ivory-50">{image.caption}</p>}
            <p className="mt-1 text-xs text-forest-300">
              {image.alt}
              {image.credit && <span className="text-forest-400"> · {image.credit}</span>}
            </p>
            <AnimatePresence>
              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 text-xs font-semibold text-gold-400"
                >
                  Link copied
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
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
