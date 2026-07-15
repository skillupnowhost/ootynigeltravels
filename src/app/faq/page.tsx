import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { HeadsetPulseIcon } from "@/components/ui/AnimatedIcons";
import { listFaqs } from "@/lib/db/queries/faqs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about booking, payments and travelling with us.",
  alternates: { canonical: "/faq" },
};

export default async function FAQPage() {
  const faqs = await listFaqs();
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow="Good to know" title="Frequently asked questions" seed="faq-hero" variant="lake">
        <span className="mt-6 inline-flex items-center gap-2 text-sm text-forest-300">
          <HeadsetPulseIcon size={20} className="text-gold-400" />
          Can&apos;t find your answer? Our team is on call every day of the year.
        </span>
      </PageHero>

      <section className="container-luxe max-w-3xl py-20">
        <RevealGroup className="space-y-12" stagger={0.12}>
          {categories.map((category) => (
            <RevealItem key={category}>
              <h2 className="mb-4 font-display text-2xl text-forest-950">{category}</h2>
              <FAQAccordion items={faqs.filter((f) => f.category === category)} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
