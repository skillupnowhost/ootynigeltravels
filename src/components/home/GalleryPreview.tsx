import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { BLUR_DATA_URL } from "@/lib/media";

type Tile =
  | { type: "photo"; src: string; alt: string; span: string }
  | { type: "scenic"; seed: string; alt: string; span: string };

const tiles: Tile[] = [
  { type: "photo", src: "/images/destinations/ooty.jpg", alt: "Ooty hills", span: "row-span-2" },
  {
    type: "photo",
    src: "/images/attractions/doddabetta-peak.jpg",
    alt: "Doddabetta Peak",
    span: "",
  },
  { type: "photo", src: "/images/destinations/kotagiri.jpg", alt: "Kotagiri tea gardens", span: "" },
  {
    type: "photo",
    src: "/images/attractions/tea-gardens.jpg",
    alt: "Tea estate near Coonoor",
    span: "",
  },
  { type: "photo", src: "/images/destinations/avalanche-lake.jpg", alt: "Avalanche & Emerald Lake", span: "" },
];

export function GalleryPreview() {
  return (
    <section className="bg-forest-50 py-24">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Gallery"
            title="A glimpse of Ooty"
            description="Real photography from across Ooty, Coonoor, Kotagiri and the tea trails between them."
          />
          <Link
            href="/gallery"
            className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-900 hover:text-gold-700"
          >
            View full gallery <ArrowRight size={16} />
          </Link>
        </div>

        <RevealGroup className="mt-14 grid auto-rows-[160px] grid-cols-2 gap-4 sm:grid-cols-3" stagger={0.08}>
          {tiles.map((tile, i) => (
            <RevealItem
              key={i}
              className={`relative overflow-hidden rounded-2xl bg-white ${tile.span}`}
            >
              {tile.type === "photo" ? (
                <Image
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                  sizes="(min-width: 640px) 33vw, 50vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              ) : (
                <ScenicArt seed={tile.seed} className="h-full w-full" />
              )}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
