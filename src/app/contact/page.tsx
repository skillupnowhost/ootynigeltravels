import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { HeadsetPulseIcon } from "@/components/ui/AnimatedIcons";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactInfoCards } from "@/components/contact/ContactInfoCards";
import { QuickActions } from "@/components/contact/QuickActions";
import { ContactMap } from "@/components/contact/ContactMap";
import { BusinessInfoStrip } from "@/components/contact/BusinessInfoStrip";
import { TestimonialSlider } from "@/components/contact/TestimonialSlider";
import { CTABanner } from "@/components/contact/CTABanner";
import { ContactEnquiryForm } from "@/components/forms/ContactEnquiryForm";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { listFaqs } from "@/lib/db/queries/faqs";
import { listApprovedReviews } from "@/lib/db/queries/reviews";
import { site } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Ooty Nigel Travels — call, WhatsApp, email or send a detailed trip enquiry. Our Nilgiris travel experts reply within hours.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const destinations = destinationsRepo.list(true);
  const fleet = fleetRepo.list(true);
  const faqs = listFaqs().slice(0, 8);
  const reviews = listApprovedReviews(8);

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

      <section className="container-luxe -mt-14 relative z-20 pb-20">
        <ContactInfoCards />
      </section>

      <section className="bg-forest-50/60 py-20">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Fast lanes"
            title="Reach Us However Suits You"
            description="Pick the channel that's fastest for you right now — a human answers every one of these."
          />
          <div className="mt-12">
            <QuickActions />
          </div>
        </div>
      </section>

      <section className="container-luxe py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              eyebrow="Plan with us"
              title="Tell Us About Your Trip"
              description="Three short steps — destination and dates, your preferences, and how to reach you. We'll take it from there."
            />
            <div className="mt-8 hidden rounded-2xl border border-forest-100 bg-white/70 p-5 backdrop-blur-md lg:block">
              <p className="text-sm leading-relaxed text-charcoal-500">
                Prefer to skip the form? Every contact card above connects straight to our
                team — WhatsApp is usually fastest.
              </p>
            </div>
          </div>
          <ContactEnquiryForm destinations={destinations} fleet={fleet} />
        </div>
      </section>

      <section className="container-luxe py-20">
        <SectionHeading
          eyebrow="Find us"
          title="Our Office in Ooty"
          description="Drop by for tea while we plan your itinerary, or get directions straight from your phone."
        />
        <div className="mt-12">
          <ContactMap />
        </div>
      </section>

      <section className="container-luxe pb-20">
        <BusinessInfoStrip />
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
        <section className="container-luxe max-w-3xl py-20">
          <SectionHeading
            eyebrow="Good to know"
            title="Frequently Asked Questions"
            description="Can't find your answer here? Our team is on call every day of the year."
          />
          <div className="mt-4 flex items-center gap-2 text-sm text-forest-600">
            <HeadsetPulseIcon size={16} className="text-gold-600" />
            <a href="/faq" className="font-semibold hover:text-gold-700 hover:underline">
              View all FAQs
            </a>
          </div>
          <div className="mt-8">
            <FAQAccordion items={faqs} />
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
