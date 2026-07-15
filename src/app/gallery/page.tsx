import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { GalleryBrowser, type GalleryGroup } from "@/components/gallery/GalleryBrowser";
import { listGalleryImages } from "@/lib/db/queries/galleryImages";
import { GALLERY_CATEGORIES } from "@/lib/data/galleryCategories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Real photography from across the Nilgiris — destinations, wildlife, our fleet and guest memories.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  const images = listGalleryImages(true);

  const groups: GalleryGroup[] = GALLERY_CATEGORIES.map((c) => ({
    slug: c.slug,
    label: c.label,
    description: c.description,
    images: images.filter((img) => img.category === c.slug),
  })).filter((g) => g.images.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="A glimpse of the drive"
        description="Real photography from across the Nilgiris — destinations, wildlife, our fleet and the memories our guests take home."
        seed="gallery-hero"
        variant="wildlife"
      />

      <Suspense fallback={null}>
        <GalleryBrowser groups={groups} />
      </Suspense>
    </>
  );
}
