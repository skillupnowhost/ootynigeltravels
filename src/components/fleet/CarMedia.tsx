"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { BLUR_DATA_URL } from "@/lib/media";

export function CarMedia({
  src,
  alt,
  interactive = false,
  priority = false,
  sizes,
  imageClassName = "",
  fit = "cover",
}: {
  src: string;
  alt: string;
  interactive?: boolean;
  priority?: boolean;
  sizes?: string;
  imageClassName?: string;
  /** "cover" for real photography (fills the frame, subtle zoom); "contain" for cutout-style renders that float on a card. */
  fit?: "cover" | "contain";
}) {
  if (fit === "cover") {
    return (
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-2xl"
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={interactive ? { scale: 1.06, transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "(min-width: 768px) 40vw, 90vw"}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className={`object-cover ${imageClassName}`}
        />
      </motion.div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <motion.div
        className="absolute inset-x-[16%] bottom-[8%] h-4 rounded-full bg-forest-950/35 blur-md"
        style={{ transformOrigin: "50% 50%" }}
        animate={{ scaleX: [1, 0.9, 1], opacity: [0.35, 0.2, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative h-full w-full"
        animate={{ y: [0, -5, 0], rotate: [-0.3, 0.3, -0.3] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        whileHover={
          interactive
            ? { x: 10, rotate: -1, scale: 1.045, transition: { duration: 0.45, ease: [0.33, 1, 0.68, 1] } }
            : undefined
        }
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "(min-width: 768px) 40vw, 90vw"}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className={`object-contain drop-shadow-[0_16px_20px_rgba(7,31,24,0.3)] ${imageClassName}`}
        />
      </motion.div>
    </div>
  );
}
