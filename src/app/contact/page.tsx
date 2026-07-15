import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { HeadsetPulseIcon } from "@/components/ui/AnimatedIcons";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { EnquirySidebar } from "@/components/contact/EnquirySidebar";
import { ContactMap } from "@/components/contact/ContactMap";
import { BusinessInfoStrip } from "@/components/contact/BusinessInfoStrip";
import { TestimonialSlider } from "@/components/contact/TestimonialSlider";
import { CTABanner } from "@/components/contact/CTABanner";
import { ContactEnquiryForm } from "@/components/forms/ContactEnquiryForm";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { listFaqs } from "@/lib/db/queries/faqs";
import { listApprovedReviews } from "@/lib/db/queries/reviews";
import { attractionsRepo } from "@/lib/db/queries/attractions";
import { listAttractionImages } from "@/lib/db/queries/attractionImages";
import { site, waLink } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Ooty Nigel Travels — call, WhatsApp, email or send a detailed trip enquiry. Our Nilgiris travel experts reply within hours.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [destinations, fleet, faqsList, reviews, attractions] = await Promise.all([
    destinationsRepo.list(true),
    fleetRepo.list(true),
    listFaqs(),
    listApprovedReviews(8),
    attractionsRepo.list(true),
  ]);
  const faqs = faqsList.slice(0, 8);
  const nearbyAttractions = await Promise.all(
    attractions.slice(0, 5).map(async (a) => ({
      slug: a.slug,
      name: a.name,
      category: a.category,
      image: (await listAttractionImages(a.id, true))[0]?.src ?? null,
    }))
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    mainEntity: {
      "@type": "TravelAgency",
      name: site.name,
      telephone: site.phone,
      email: site.email,
      address: site.address,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ContactHero />

      <section id="channels" className="container-luxe -mt-14 relative z-20 pb-20 scroll-mt-24">
        <SectionHeading
          eyebrow="Fast lanes"
          title="Reach Us However Suits You"
          description="Pick the channel that's fastest for you right now — a human (or Nigel, our AI concierge) answers every one of these."
        />
        <div className="mt-10">
          <ContactChannels />
        </div>
      </section>

      <section id="enquiry-form" className="bg-forest-50/60 py-20 scroll-mt-24">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Plan with us"
            title="Tell Us About Your Trip"
            description="Three short steps — destination and dates, your preferences, and how to reach you. We'll take it from there."
          />
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <EnquirySidebar />
            </div>
            <ContactEnquiryForm destinations={destinations} fleet={fleet} />
          </div>
        </div>
      </section>

      <section className="container-luxe py-20">
        <SectionHeading
          eyebrow="Find us"
          title="Our Office in Ooty"
          description="Drop by for tea while we plan your itinerary, or get directions straight from your phone."
        />
        <div className="mt-12 space-y-8">
          <ContactMap nearbyAttractions={nearbyAttractions} />
          <BusinessInfoStrip />
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="bg-forest-50/60 py-20">
          <div className="container-luxe">
            <SectionHeading
              eyebrow="Guest voices"
              title="What Travellers Tell Us"
              align="center"
              description="A few words from guests we've planned Nilgiris journeys for."
            />
            <div className="mt-12">
              <TestimonialSlider reviews={reviews} />
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="container-luxe py-20">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                eyebrow="Good to know"
                title="Frequently Asked Questions"
                description="Can't find your answer here? Our team is on call every day of the year."
              />
              <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-forest-100 bg-white/70 p-5 backdrop-blur-md">
                <p className="text-sm leading-relaxed text-charcoal-500">
                  Still stuck? Reach a real person or browse every question we&rsquo;ve answered.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <a href={waLink(`Hello ${site.name}, I have a question.`)} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest-800 hover:text-gold-700 hover:underline">
                    Message on WhatsApp
                  </a>
                  <a href="/faq" className="inline-flex items-center gap-1.5 font-semibold text-forest-800 hover:text-gold-700 hover:underline">
                    <HeadsetPulseIcon size={15} className="text-gold-600" />
                    View all FAQs
                  </a>
                </div>
              </div>
            </div>
            <FAQAccordion items={faqs} />
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
