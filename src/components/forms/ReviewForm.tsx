"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitReview, type ReviewFormState } from "@/lib/actions/public";
import { Button } from "@/components/ui/Button";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";

const initialState: ReviewFormState = { ok: false };

export function ReviewForm() {
  const [state, formAction, pending] = useActionState(submitReview, initialState);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-forest-100 bg-forest-50 p-10 text-center">
        <CheckCircle2 size={36} className="text-forest-700" />
        <p className="font-display text-lg text-forest-950">Thank you for sharing</p>
        <p className="text-sm text-charcoal-500">
          Your review has been submitted and will appear once our team reviews it.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-forest-100 bg-white p-7">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor="customer_name">
          Your name
        </label>
        <input
          id="customer_name"
          name="customer_name"
          required
          className="w-full rounded-xl border border-forest-200 px-4 py-3 text-sm outline-none focus:border-gold-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor="email">
          Email <span className="font-normal text-charcoal-400">(optional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-xl border border-forest-200 px-4 py-3 text-sm outline-none focus:border-gold-500"
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-forest-900">Rating</span>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={`text-gold-500 transition-opacity ${n <= (hoverRating || rating) ? "opacity-100" : "opacity-30"}`}
            >
              <GlowStarIcon size={26} loop={n <= rating} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor="comment">
          Your review
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          required
          minLength={10}
          className="w-full rounded-xl border border-forest-200 px-4 py-3 text-sm outline-none focus:border-gold-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
