import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { CalendarCheckIcon, MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { packagesRepo } from "@/lib/db/queries/packages";
import { site } from "@/lib/config/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const destination = await destinationsRepo.getBySlug(slug);
  if (!destination) return {};
  return {
    title: `${destination.name} — Taxi, Tours & Packages`,
    description: destination.description ?? undefined,
    alternates: { canonical: `/destinations/${destination.slug}` },
    ...(destination.image ? { openGraph: { images: [destination.image] } } : {}),
  };
}

export default async function DestinationDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const destination = await destinationsRepo.getBySlug(slug);
  if (!destination || !destination.active) notFound();

  const relatedPackages = (await packagesRepo.list(true)).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristAttraction",
        name: destination.name,
        description: destination.description ?? undefined,
        ...(destination.image
          ? { image: destination.image.startsWith("/") ? `${site.url}${destination.image}` : destination.image }
          : {}),
        address: {
          "@type": "PostalAddress",
          addressRegion: "Tamil Nadu",
          addressCountry: "IN",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Destinations", item: `${site.url}/destinations` },
          { "@type": "ListItem", position: 3, name: destination.name, item: `${site.url}/destinations/${destination.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow={destination.region ?? "Destination"}
        title={destination.name}
        description={destination.description ?? undefined}
        seed={destination.slug}
        image={destination.image}
      />

      <section className="container-luxe py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <Reveal>
            {destination.highlights.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-forest-950">Highlights</h2>
                <RevealGroup className="mt-6 space-y-3" stagger={0.06}>
                  {destination.highlights.map((h) => (
                    <RevealItem key={h} className="group flex items-start gap-2 text-sm text-charcoal-700">
                      <MotionIcon preset="pop" loop>
                        <Check size={16} className="mt-0.5 shrink-0 text-forest-600 transition-colors group-hover:text-gold-600" />
                      </MotionIcon>
                      {h}
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            )}

            <div className="mt-12">
              <h2 className="font-display text-2xl text-forest-950">Plan a visit</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal-500">
                {destination.name} can be booked as a standalone transfer, or as one stop on a
                multi-town signature circuit. Tell us your dates via our booking form or WhatsApp
                and we&apos;ll shape an itinerary around them.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <LinkButton href="/booking" variant="gold">
                  Start a Booking
                </LinkButton>
                <LinkButton href="/packages" variant="outline">
                  Browse Packages
                </LinkButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <aside className="h-fit space-y-4 rounded-3xl border border-forest-100 bg-white p-7">
              <div className="flex items-start gap-2 text-sm text-charcoal-700">
                <MapPinDropIcon size={18} className="mt-0.5 shrink-0 text-gold-700" />
                <span>{destination.distance_from_ooty} from Ooty</span>
              </div>
              {destination.best_season && (
                <div className="flex items-start gap-2 text-sm text-charcoal-700">
                  <CalendarCheckIcon size={18} loop={false} className="mt-0.5 shrink-0 text-gold-700" />
                  <span>Best season: {destination.best_season}</span>
                </div>
              )}
              {relatedPackages.length > 0 && (
                <div className="border-t border-forest-100 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                    Related packages
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {relatedPackages.map((p) => (
                      <li key={p.slug}>
                        <a
                          href={`/packages/${p.slug}`}
                          className="group inline-flex items-center gap-1 text-sm font-medium text-forest-900 transition-colors hover:text-gold-700"
                        >
                          <span className="transition-transform duration-200 group-hover:translate-x-0.5">{p.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
