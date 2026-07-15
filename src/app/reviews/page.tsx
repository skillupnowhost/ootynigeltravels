import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { averageRating, listApprovedReviews } from "@/lib/db/queries/reviews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews",
  description: "What travellers say after touring the Nilgiris with us.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  const reviews = listApprovedReviews();
  const { average, count } = averageRating();

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
      </PageHero>

      <section className="container-luxe py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <RevealGroup className="grid gap-6 sm:grid-cols-2" stagger={0.08}>
            {reviews.map((r) => (
              <RevealItem
                key={r.id}
                className="rounded-3xl border border-forest-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(11,59,46,0.25)]"
              >
                <div className="flex gap-0.5 text-gold-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <GlowStarIcon key={i} size={14} loop={false} className={i < r.rating ? "opacity-100" : "opacity-30"} />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-charcoal-700">&ldquo;{r.comment}&rdquo;</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                  {r.customer_name} · {r.source === "google" ? "Google" : "Website"}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>

          <aside className="h-fit">
            <h2 className="font-display text-xl text-forest-950">Share your experience</h2>
            <div className="mt-4">
              <ReviewForm />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
