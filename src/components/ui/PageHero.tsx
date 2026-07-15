import type { ReactNode } from "react";
import Image from "next/image";
import { ScenicArt, type ScenicVariant } from "./ScenicArt";

export function PageHero({
  eyebrow,
  title,
  description,
  seed = "page",
  variant,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  seed?: string;
  variant?: ScenicVariant;
  image?: string | null;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-forest-950 pt-32 pb-20 text-ivory-50">
      {image ? (
        <Image src={image} alt="" fill priority className="absolute inset-0 h-full w-full object-cover opacity-40" />
      ) : (
        <ScenicArt seed={seed} variant={variant} className="absolute inset-0 h-full w-full opacity-25" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/85 to-forest-950/60" />
      <div className="container-luxe relative">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
          <span className="h-px w-8 bg-gold-500" aria-hidden />
          {eyebrow}
        </span>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.1] text-ivory-50 sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base text-forest-200 sm:text-lg">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
