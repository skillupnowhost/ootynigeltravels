import { listAllReviews } from "@/lib/db/queries/reviews";
import { approveReviewAction, deleteReviewAction, rejectReviewAction } from "@/lib/actions/adminModeration";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireRole(["admin", "manager"]);
  const reviews = await listAllReviews();

  return (
    <div>
      <Reveal>
        <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Reviews</h1>

        <div className="mt-4 space-y-4 sm:mt-6">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-forest-100 bg-white p-4 transition-shadow duration-200 hover:shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-forest-900">{r.customer_name}</p>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <GlowStarIcon
                        key={i}
                        size={14}
                        loop={false}
                        className={i < r.rating ? "text-gold-500" : "text-forest-200"}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      r.approved ? "bg-forest-100 text-forest-800" : "bg-gold-50 text-gold-800"
                    }`}
                  >
                    {r.approved ? "Published" : "Pending"}
                  </span>
                  <DeleteButton action={deleteReviewAction} id={r.id} confirmLabel={`Delete this review by ${r.customer_name}?`} />
                </div>
              </div>
              <p className="mt-3 text-sm text-charcoal-700">{r.comment}</p>
              <p className="mt-2 text-xs text-charcoal-400">
                {formatDate(r.created_at)} · {r.source}
              </p>
              <div className="mt-4 flex gap-3">
                {!r.approved && (
                  <form action={approveReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-forest-700 transition-colors duration-200 hover:bg-forest-50 hover:text-forest-900"
                    >
                      Approve
                    </button>
                  </form>
                )}
                {r.approved && (
                  <form action={rejectReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-charcoal-500 transition-colors duration-200 hover:bg-ivory-100 hover:text-charcoal-900"
                    >
                      Unpublish
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-charcoal-500">No reviews yet.</p>}
        </div>
      </Reveal>
    </div>
  );
}
