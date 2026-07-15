import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Users } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { CarDriveIcon, SparkleBurstIcon, ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";
import { PhotoGallery } from "@/components/fleet/PhotoGallery";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { formatINR } from "@/lib/format";
import { site, waLink } from "@/lib/config/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await fleetRepo.getBySlug(slug);
  if (!vehicle) return {};
  return {
    title: vehicle.name,
    description: `Book the ${vehicle.name} (${vehicle.category}) with a private chauffeur — ${vehicle.seats} seats, from ${formatINR(vehicle.price_per_day)}/day.`,
    alternates: { canonical: `/fleet/${vehicle.slug}` },
  };
}

export default async function FleetDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const vehicle = await fleetRepo.getBySlug(slug);
  if (!vehicle || !vehicle.active) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vehicle.name,
    category: vehicle.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: vehicle.price_per_day,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow={vehicle.category} title={vehicle.name} seed={vehicle.slug} variant="mountains" />

      <section className="container-luxe py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <Reveal>
            {vehicle.model_kind === "photo" && vehicle.gallery.length > 0 ? (
              <PhotoGallery images={vehicle.gallery} alt={vehicle.name} />
            ) : vehicle.model_kind === "3d" ? (
              <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-forest-900 to-forest-950 text-center text-ivory-50 sm:h-[420px]">
                <SparkleBurstIcon size={44} className="text-gold-400" />
                <p className="max-w-xs text-sm text-forest-200">
                  Explore the {vehicle.name} in interactive 3D on our homepage hero.
                </p>
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-forest-50 to-forest-100 sm:h-[420px]">
                <CarDriveIcon size={104} className="text-forest-300" />
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-forest-100 bg-white p-8">
              <div className="flex items-center gap-6 border-b border-forest-100 pb-6 text-sm text-charcoal-500">
                <span className="inline-flex items-center gap-1.5">
                  <MotionIcon preset="bounce" className="text-gold-700">
                    <Users size={16} />
                  </MotionIcon>
                  {vehicle.seats} seats
                </span>
                {vehicle.luggage && <span>{vehicle.luggage} luggage</span>}
              </div>

              <h2 className="mt-6 flex items-center gap-2 font-display text-xl text-forest-950">
                <ShieldBadgeIcon size={20} className="text-gold-700" />
                What&apos;s included
              </h2>
              <ul className="mt-4 space-y-3">
                {vehicle.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-charcoal-700">
                    <MotionIcon preset="pop" className="mt-0.5 shrink-0 text-gold-700">
                      <Check size={16} />
                    </MotionIcon>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-end justify-between border-t border-forest-100 pt-6">
                <div>
                  <span className="text-xs uppercase tracking-wide text-charcoal-500">Starting from</span>
                  <p className="font-display text-3xl text-forest-950">
                    {formatINR(vehicle.price_per_day)}
                    <span className="text-sm font-sans text-charcoal-500"> /day</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton
                  href={waLink(`Hello ${site.name}, I'd like to enquire about the ${vehicle.name}.`)}
                  variant="gold"
                >
                  Ask on WhatsApp
                </LinkButton>
                <LinkButton href="/packages" variant="outline">
                  Browse Travel Packages
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
