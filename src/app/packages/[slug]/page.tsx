import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, X, Route, MapPinned, Sun, Star } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { ClockHandsIcon, MapPinDropIcon, GlowStarIcon } from "@/components/ui/AnimatedIcons";
import { PhotoGallery } from "@/components/fleet/PhotoGallery";
import { CarMedia } from "@/components/fleet/CarMedia";
import { PackageCard } from "@/components/packages/PackageCard";
import { WishlistButton } from "@/components/packages/WishlistButton";
import { ShareButton } from "@/components/packages/ShareButton";
import { packagesRepo, relatedPackages } from "@/lib/db/queries/packages";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { listDrivers } from "@/lib/db/queries/drivers";
import { listReviewsForPackage } from "@/lib/db/queries/reviews";
import { formatINR } from "@/lib/format";
import { site, waLink } from "@/lib/config/site";
import { tripCategoryMeta } from "@/lib/config/tripCategories";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await packagesRepo.getBySlug(slug);
  if (!pkg) return {};
  const ogImage = pkg.gallery[0] ?? pkg.hero_image;
  return {
    title: pkg.name,
    description: pkg.summary ?? pkg.tagline ?? undefined,
    alternates: { canonical: `/packages/${pkg.slug}` },
    ...(ogImage ? { openGraph: { images: [ogImage] } } : {}),
  };
}

export default async function PackageDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const pkg = await packagesRepo.getBySlug(slug);
  if (!pkg || !pkg.active) notFound();
  const categoryMeta = tripCategoryMeta(pkg.category);
  const matchingVehicles = (await fleetRepo.list(true)).filter((v) => pkg.vehicle_options.includes(v.category));
  const sampleDrivers = (await listDrivers({ activeOnly: true })).slice(0, 2);
  const reviews = await listReviewsForPackage(pkg.id, 6);
  const related = await relatedPackages(pkg, 3);
  const hasDiscount = pkg.original_price != null && pkg.original_price > pkg.price_from;
  const discountPct = hasDiscount ? Math.round((1 - pkg.price_from / (pkg.original_price as number)) * 100) : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.name,
    description: pkg.summary,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: pkg.price_from,
    },
    ...(pkg.review_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: pkg.rating,
        reviewCount: pkg.review_count,
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow={categoryMeta?.label ?? "Package"}
        title={pkg.name}
        description={pkg.tagline ?? undefined}
        seed={pkg.slug}
        variant="tea-rows"
        image={pkg.gallery[0] ?? pkg.hero_image}
      >
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {categoryMeta && (
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-400/10 px-3.5 py-1.5 text-xs font-semibold text-gold-300">
              {categoryMeta.icon(14)}
              {categoryMeta.label}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ivory-50/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-ivory-50">
            <Star size={13} className="fill-gold-400 text-gold-400" />
            {pkg.rating.toFixed(1)} <span className="text-forest-300">({pkg.review_count} reviews)</span>
          </span>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <LinkButton href={`/booking?package=${pkg.slug}`} variant="gold">
            Book This Package
          </LinkButton>
          <LinkButton href={`/packages/customize?package=${pkg.slug}`} variant="outline-invert">
            Customize This Package
          </LinkButton>
          <LinkButton
            href={waLink(`Hello ${site.name}, I'd like to know more about ${pkg.name}.`)}
            variant="ghost"
            className="text-ivory-50 hover:bg-forest-800"
          >
            Ask on WhatsApp
          </LinkButton>
          <div className="flex gap-2">
            <WishlistButton slug={pkg.slug} className="border-ivory-50/30 bg-white/5 text-ivory-50 hover:border-gold-400 hover:text-gold-300" />
            <ShareButton
              title={pkg.name}
              text={pkg.tagline ?? undefined}
              url={`/packages/${pkg.slug}`}
              className="border-ivory-50/30 bg-white/5 text-ivory-50 hover:border-gold-400 hover:text-gold-300"
            />
          </div>
        </div>
      </PageHero>

      {pkg.gallery.length > 0 && (
        <section className="container-luxe -mt-10 relative z-10 pb-4">
          <PhotoGallery images={pkg.gallery} alt={pkg.name} />
        </section>
      )}

      <section className="container-luxe py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <Reveal>
              <p className="text-lg leading-relaxed text-charcoal-700">{pkg.description}</p>
            </Reveal>

            {pkg.places_covered.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-xl text-forest-950">Places Covered</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pkg.places_covered.map((place) => (
                    <span key={place} className="rounded-full border border-forest-100 bg-forest-50 px-3.5 py-1.5 text-xs font-medium text-forest-800">
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {pkg.distance_label && (
                <InfoCard icon={<Route size={18} />} label="Travel Distance" value={pkg.distance_label} />
              )}
              {pkg.pickup_drop && (
                <InfoCard icon={<MapPinned size={18} />} label="Pickup & Drop" value={pkg.pickup_drop} />
              )}
              {pkg.best_time && <InfoCard icon={<Sun size={18} />} label="Best Time to Visit" value={pkg.best_time} />}
            </div>

            {pkg.itinerary.length > 0 && (
              <div className="mt-12">
                <h2 className="flex items-center gap-2 font-display text-2xl text-forest-950">
                  <MapPinDropIcon size={22} className="text-gold-600" />
                  Itinerary
                </h2>
                <ol className="mt-6 space-y-6 border-l-2 border-forest-100 pl-6">
                  {pkg.itinerary.map((day) => (
                    <li key={day.day} className="group relative">
                      <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-forest-900 text-[11px] font-semibold text-ivory-50 transition-transform duration-300 group-hover:scale-110">
                        {day.day}
                      </span>
                      <h3 className="font-display text-lg text-forest-950">{day.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-charcoal-500">{day.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {(pkg.includes.length > 0 || pkg.excludes.length > 0) && (
              <div className="mt-12 grid gap-8 sm:grid-cols-2">
                {pkg.includes.length > 0 && (
                  <div>
                    <h2 className="font-display text-xl text-forest-950">Included</h2>
                    <ul className="mt-4 space-y-2.5">
                      {pkg.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-charcoal-700">
                          <MotionIcon preset="pop" className="mt-0.5 shrink-0 text-forest-600">
                            <Check size={16} />
                          </MotionIcon>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pkg.excludes.length > 0 && (
                  <div>
                    <h2 className="font-display text-xl text-forest-950">Not included</h2>
                    <ul className="mt-4 space-y-2.5">
                      {pkg.excludes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-charcoal-700">
                          <MotionIcon preset="wiggle" className="mt-0.5 shrink-0 text-charcoal-500">
                            <X size={16} />
                          </MotionIcon>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {matchingVehicles.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-xl text-forest-950">Vehicle Information</h2>
                <p className="mt-1 text-sm text-charcoal-500">
                  Exact model may vary by availability — same class of vehicle guaranteed.
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {matchingVehicles.map((v) => (
                    <div key={v.slug} className="flex gap-4 rounded-2xl border border-forest-100 p-4">
                      <div className="h-20 w-28 shrink-0">
                        {v.hero_asset && v.model_kind === "photo" ? (
                          <CarMedia src={v.hero_asset} alt={v.name} sizes="120px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-xl bg-forest-50 text-xs text-forest-400">
                            {v.category}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-base text-forest-950">{v.name}</h3>
                        <p className="mt-1 text-xs text-charcoal-500">
                          {v.category} · {v.seats} seats{v.luggage ? ` · ${v.luggage}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(pkg.driver_info || sampleDrivers.length > 0) && (
              <div className="mt-12">
                <h2 className="font-display text-xl text-forest-950">Driver Information</h2>
                {pkg.driver_info && <p className="mt-2 text-sm leading-relaxed text-charcoal-700">{pkg.driver_info}</p>}
                {sampleDrivers.length > 0 && (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {sampleDrivers.map((d) => (
                      <div key={d.slug} className="rounded-2xl border border-forest-100 p-4">
                        <h3 className="font-display text-base text-forest-950">{d.name}</h3>
                        <p className="mt-1 text-xs text-charcoal-500">
                          {d.experience_years}+ yrs experience · {d.languages.join(", ")}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-gold-700">
                          <Star size={12} className="fill-gold-500 text-gold-500" /> {d.rating.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-charcoal-400">Your specific driver is confirmed at booking, based on availability.</p>
              </div>
            )}

            {(reviews.length > 0 || pkg.review_count > 0) && (
              <div className="mt-12">
                <h2 className="flex items-center gap-2 font-display text-2xl text-forest-950">
                  Ratings &amp; Reviews
                </h2>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex gap-0.5 text-gold-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <GlowStarIcon key={i} size={18} loop={false} className={i < Math.round(pkg.rating) ? "opacity-100" : "opacity-30"} />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-forest-950">{pkg.rating.toFixed(1)} / 5</span>
                  <span className="text-sm text-charcoal-500">({pkg.review_count} reviews)</span>
                </div>
                {reviews.length > 0 && (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {reviews.map((r) => (
                      <div key={r.id} className="rounded-2xl border border-forest-100 p-5">
                        <div className="flex gap-0.5 text-gold-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <GlowStarIcon key={i} size={13} loop={i < r.rating} className={i < r.rating ? "opacity-100" : "opacity-30"} />
                          ))}
                        </div>
                        <p className="mt-2.5 text-sm leading-relaxed text-charcoal-700">&ldquo;{r.comment}&rdquo;</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-charcoal-500">{r.customer_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {pkg.faqs.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl text-forest-950">Frequently asked</h2>
                <div className="mt-6">
                  <FAQAccordion items={pkg.faqs} />
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-3xl border border-forest-100 bg-white p-7">
            {pkg.duration_label && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-xs font-medium text-forest-800">
                <ClockHandsIcon size={12} loop={false} /> {pkg.duration_label}
              </span>
            )}
            <div className="mt-4">
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-charcoal-400 line-through">{formatINR(pkg.original_price as number)}</span>
                  <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-800">{discountPct}% OFF</span>
                </div>
              )}
              <span className="text-xs uppercase tracking-wide text-charcoal-500">Starting from</span>
              <span className="mt-1 block font-display text-3xl text-forest-950">
                {formatINR(pkg.price_from)}
                <span className="ml-1 text-sm font-sans font-normal text-charcoal-500">/ person</span>
              </span>
              <p className="mt-1 text-xs text-charcoal-400">
                Final total depends on travellers, hotel category and vehicle —{" "}
                <a href={`/packages/customize?package=${pkg.slug}`} className="font-semibold text-gold-700 hover:underline">
                  customize for an exact quote
                </a>
                .
              </p>
            </div>
            {pkg.highlights.length > 0 && (
              <ul className="mt-6 space-y-2.5 border-t border-forest-100 pt-6">
                {pkg.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-charcoal-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-gold-700" /> {h}
                  </li>
                ))}
              </ul>
            )}
            <LinkButton href={`/booking?package=${pkg.slug}`} variant="gold" className="mt-6 w-full justify-center">
              Book Now
            </LinkButton>
            <LinkButton
              href={`/packages/customize?package=${pkg.slug}`}
              variant="outline"
              className="mt-3 w-full justify-center"
            >
              Customize Package
            </LinkButton>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-20 border-t border-forest-100 pt-16">
            <h2 className="font-display text-2xl text-forest-950">You may also like</h2>
            <p className="mt-2 text-sm text-charcoal-500">More {categoryMeta?.label.toLowerCase() ?? "trips"} from our collection.</p>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {related.map((r) => (
                <PackageCard key={r.slug} pkg={r} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-forest-100 p-4">
      <span className="text-gold-600">{icon}</span>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-charcoal-500">{label}</p>
      <p className="mt-1 text-sm text-forest-950">{value}</p>
    </div>
  );
}
