import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { CompassIcon } from "@/components/ui/AnimatedIcons";
import { SERVICES } from "@/lib/data/services";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Taxi & Travel Services in Ooty",
  description:
    "Ooty taxi and cab booking, airport and station transfers, one-way and round-trip taxi, local sightseeing and corporate travel — all with a private chauffeur.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.name,
        url: `${site.url}/services/${s.slug}`,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="Our Services"
        title="Taxi and travel services across the Nilgiris"
        description="Airport and station transfers, one-way and round-trip taxi, local sightseeing and corporate travel — every trip with a private chauffeur."
        seed="services-hero"
        variant="mountains"
      />

      <section className="container-luxe py-20">
        <Reveal>
          <div className="flex items-center gap-2.5 text-sm font-medium text-charcoal-500">
            <CompassIcon size={20} className="text-gold-600" />
            Tap any service for details, fares on request, and instant booking
          </div>
        </Reveal>

        <RevealGroup className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {SERVICES.map((s) => (
            <RevealItem key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group block overflow-hidden rounded-3xl border border-forest-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-30px_rgba(11,59,46,0.35)]"
              >
                <div className="relative h-40 overflow-hidden">
                  <ScenicArt
                    seed={s.slug}
                    variant={s.heroVariant}
                    className="h-full w-full scale-105 transition-transform duration-700 group-hover:scale-[1.15]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-forest-950/5 to-transparent transition-opacity duration-300 group-hover:from-forest-950/75" />
                </div>
                <div className="p-6">
                  <h2 className="font-display text-lg text-forest-950 transition-colors group-hover:text-gold-700">
                    {s.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-charcoal-500">{s.cardBlurb}</p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
