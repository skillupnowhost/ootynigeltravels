"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { CategoryPillNav } from "@/components/ui/CategoryPillNav";
import { ExploreButton } from "@/components/home/ExploreButton";
import { GalleryLightbox } from "./GalleryLightbox";
import type { GalleryImage } from "@/lib/db/types";

export interface GalleryGroup {
  slug: string;
  label: string;
  description: string;
  images: GalleryImage[];
}

export function GalleryBrowser({ groups }: { groups: GalleryGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPhoto = searchParams.get("photo");
  const openId = rawPhoto ? Number(rawPhoto) : null;

  const openImage = openId ? groups.flatMap((g) => g.images).find((i) => i.id === openId) ?? null : null;
  const categoryImages = openImage ? groups.find((g) => g.slug === openImage.category)?.images ?? [] : [];

  function openPhoto(id: number) {
    router.replace(`${pathname}?photo=${id}`, { scroll: false });
  }

  function closePhoto() {
    router.replace(pathname, { scroll: false });
  }

  function navigate(direction: 1 | -1) {
    if (!openImage || categoryImages.length === 0) return;
    const idx = categoryImages.findIndex((i) => i.id === openImage.id);
    const next = categoryImages[(idx + direction + categoryImages.length) % categoryImages.length];
    openPhoto(next.id);
  }

  return (
    <>
      <CategoryPillNav
        layoutId="gallery-pill-active"
        categories={groups.map((g) => ({ slug: g.slug, label: g.label, count: g.images.length }))}
      />

      {groups.map((g) => (
        <section id={`cat-${g.slug}`} key={g.slug} className="scroll-mt-40 py-14 sm:py-16">
          <div className="container-luxe">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-forest-950 sm:text-3xl">{g.label}</h2>
                <p className="mt-1 max-w-xl text-sm text-charcoal-500">{g.description}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-charcoal-400">
                {g.images.length} photo{g.images.length === 1 ? "" : "s"}
              </span>
            </div>

            <RevealGroup className="grid auto-rows-[200px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4" stagger={0.04}>
              {g.images.map((img, i) => (
                <RevealItem
                  key={img.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(11,59,46,0.4)] ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openPhoto(img.id)}
                    aria-label={`Open photo: ${img.alt}`}
                    className="absolute inset-0 h-full w-full cursor-zoom-in"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {img.featured === 1 && (
                      <span className="absolute left-3 top-3 rounded-full bg-gold-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-forest-950">
                        Featured
                      </span>
                    )}
                  </button>
                  <ExploreButton placeName={img.alt} className="absolute right-3 top-3 z-10" />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ))}

      <GalleryLightbox image={openImage} categoryImages={categoryImages} onClose={closePhoto} onNavigate={navigate} />
    </>
  );
}
