import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Phone } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { LinkButton } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { WhatsAppGlyphIcon } from "@/components/ui/BrandIcons";
import { SERVICES, getServiceBySlug } from "@/lib/data/services";
import { packagesRepo } from "@/lib/db/queries/packages";
import { site, waLink } from "@/lib/config/site";
import { serializeJsonLd } from "@/lib/seo/jsonLd";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const svc = getServiceBySlug(slug);
  if (!svc) return {};
  return {
    title: svc.seoTitle,
    description: svc.metaDescription,
    alternates: { canonical: `/services/${svc.slug}` },
    openGraph: { title: svc.seoTitle, description: svc.metaDescription },
  };
}

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const svc = getServiceBySlug(slug);
  if (!svc) notFound();

  const allPackages = await packagesRepo.list(true).catch(() => []);
  const relatedPackages = (
    svc.relatedPackageCategory
      ? allPackages.filter((p) => p.category === svc.relatedPackageCategory)
      : allPackages
  ).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${site.url}/services/${svc.slug}#service`,
        name: svc.name,
        description: svc.metaDescription,
        provider: { "@id": `${site.url}/#business` },
        areaServed: site.areaServed.map((area) => ({ "@type": "City", name: area })),
        url: `${site.url}/services/${svc.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Services", item: `${site.url}/services` },
          { "@type": "ListItem", position: 3, name: svc.name, item: `${site.url}/services/${svc.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: svc.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <PageHero
        eyebrow={svc.eyebrow}
        title={svc.heroTitle}
        description={svc.heroDescription}
        seed={svc.slug}
        variant={svc.heroVariant}
      />

      <section className="container-luxe py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
          <Reveal>
            <div className="space-y-5 text-sm leading-relaxed text-charcoal-700">
              {svc.overview.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="font-display text-2xl text-forest-950">Why choose this service</h2>
              <RevealGroup className="mt-6 space-y-3" stagger={0.06}>
                {svc.highlights.map((h) => (
                  <RevealItem key={h} className="group flex items-start gap-2 text-sm text-charcoal-700">
                    <MotionIcon preset="pop" loop>
                      <Check size={16} className="mt-0.5 shrink-0 text-forest-600 transition-colors group-hover:text-gold-600" />
                    </MotionIcon>
                    {h}
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>

            <div className="mt-12">
              <h2 className="font-display text-2xl text-forest-950">How it works</h2>
              <RevealGroup className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" stagger={0.08}>
                {svc.howItWorks.map((step, i) => (
                  <RevealItem
                    key={step.step}
                    className="rounded-2xl border border-forest-100 bg-white p-5"
                  >
                    <span className="font-display text-xs font-semibold uppercase tracking-wide text-gold-700">
                      Step {i + 1}
                    </span>
                    <h3 className="mt-1.5 text-sm font-semibold text-forest-950">{step.step}</h3>
                    <p className="mt-1.5 text-sm text-charcoal-500">{step.detail}</p>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>

            <div className="mt-12">
              <h2 className="font-display text-2xl text-forest-950">Frequently asked questions</h2>
              <div className="mt-6">
                <FAQAccordion items={svc.faqs} />
              </div>
            </div>

            <div className="mt-12 rounded-3xl border border-forest-100 bg-forest-950 p-8 text-ivory-50 sm:p-10">
              <h2 className="font-display text-2xl">Ready to book {svc.name.toLowerCase()}?</h2>
              <p className="mt-2 max-w-xl text-sm text-forest-200">
                Share your dates and pickup point — we&apos;ll confirm a fare and driver within minutes.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <LinkButton href="/booking" variant="gold">
                  Start a Booking
                </LinkButton>
                <LinkButton
                  href={waLink(`Hi ${site.name}, I'd like to enquire about ${svc.name}.`)}
                  variant="outline-invert"
                  icon={false}
                >
                  <MotionIcon preset="pulse" loop>
                    <WhatsAppGlyphIcon size={16} />
                  </MotionIcon>
                  WhatsApp Us
                </LinkButton>
                <LinkButton href={site.phoneHref} variant="outline-invert" icon={false}>
                  <MotionIcon preset="ring">
                    <Phone size={16} />
                  </MotionIcon>
                  Call {site.phone}
                </LinkButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <aside className="h-fit space-y-4 rounded-3xl border border-forest-100 bg-white p-7">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                All services
              </h3>
              <ul className="space-y-2">
                {SERVICES.filter((s) => s.slug !== svc.slug)
                  .slice(0, 6)
                  .map((s) => (
                    <li key={s.slug}>
                      <a
                        href={`/services/${s.slug}`}
                        className="group inline-flex items-center gap-1 text-sm font-medium text-forest-900 transition-colors hover:text-gold-700"
                      >
                        <span className="transition-transform duration-200 group-hover:translate-x-0.5">{s.name}</span>
                      </a>
                    </li>
                  ))}
              </ul>

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
