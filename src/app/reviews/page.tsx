import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";
import { LinkButton } from "@/components/ui/Button";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { GoogleReviewsFeed } from "@/components/reviews/GoogleReviewsFeed";
import { averageRating, listApprovedReviews } from "@/lib/db/queries/reviews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews",
  description: "What travellers say after touring the Nilgiris with us.",
  alternates: { canonical: "/reviews" },
};

function GoogleReviewsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-3xl border border-forest-100 bg-forest-50/60" />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const [reviews, { average, count }] = await Promise.all([listApprovedReviews(), averageRating()]);

  return (
    <>
      <PageHero
        eyebrow="Reviews"
        title="What guests say after the drive"
        seed="reviews-hero"
        variant="lake"
      >
        <div className="mt-6 flex items-center gap-3">
          <div className="flex gap-0.5 text-gold-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <GlowStarIcon key={i} size={20} className={i < Math.round(average) ? "opacity-100" : "opacity-30"} />
            ))}
          </div>
          <span className="text-lg font-semibold text-ivory-50">{average.toFixed(1)} / 5</span>
          <span className="text-sm text-forest-300">({count} reviews)</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
          <LinkButton href="#google-reviews" variant="outline-invert" className="flex-1 sm:flex-none">
            Read Our Google Reviews
          </LinkButton>
          <LinkButton href="#feedback" variant="gold" className="flex-1 sm:flex-none">
            Submit Your Feedback
          </LinkButton>
        </div>
      </PageHero>

      <section id="google-reviews" className="container-luxe scroll-mt-24 py-20">
        <SectionHeading eyebrow="Trusted by travellers" title="Google Reviews" />
        <div className="mt-8">
          <Suspense fallback={<GoogleReviewsSkeleton />}>
            <GoogleReviewsFeed />
          </Suspense>
        </div>
      </section>

      <section id="feedback" className="scroll-mt-24 border-t border-forest-100 bg-forest-50/40 py-20">
        <div className="container-luxe">
          <SectionHeading eyebrow="Tell us about your trip" title="Client Feedback" />

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
            <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2" stagger={0.08}>
              {reviews.map((r) => (
                <RevealItem
                  key={r.id}
                  className="rounded-3xl border border-forest-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(11,59,46,0.25)]"
                >
                  <div className="flex gap-0.5 text-gold-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <GlowStarIcon key={i} size={14} loop={i < r.rating} className={i < r.rating ? "opacity-100" : "opacity-30"} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal-700">&ldquo;{r.comment}&rdquo;</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                    {r.customer_name} · Website
                  </p>
                </RevealItem>
              ))}
              {reviews.length === 0 && (
                <p className="text-sm text-charcoal-500 sm:col-span-2">
                  Be the first to share your experience with us.
                </p>
              )}
            </RevealGroup>

            <aside className="h-fit">
              <h3 className="font-display text-xl text-forest-950">Submit Your Feedback</h3>
              <p className="mt-1 text-sm text-charcoal-500">
                Approved by our team, then published alongside our Google reviews.
              </p>
              <div className="mt-4">
                <ReviewForm />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
