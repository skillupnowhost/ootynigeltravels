import Image from "next/image";
import { GoogleIcon } from "@/components/ui/BrandIcons";
import { GlowStarIcon } from "@/components/ui/AnimatedIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { getGoogleReviews, googleMapsPlaceUrl } from "@/lib/googleReviews";

const AVATAR_TONES = ["#123f31", "#a67c34", "#1b5744", "#6e5220", "#24705a"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function toneFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export async function GoogleReviewsFeed() {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const data = await getGoogleReviews();

  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-forest-200 bg-forest-50/50 p-8 text-center">
        <GoogleIcon size={28} className="mx-auto" />
        <p className="mt-3 font-display text-lg text-forest-950">Our Google reviews</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-charcoal-500">
          {placeId
            ? "We're unable to load live reviews right now — please check back shortly."
            : "Live reviews aren't connected yet."}
        </p>
        {placeId && (
          <LinkButton href={googleMapsPlaceUrl(placeId)} variant="outline" className="mt-5">
            Read our reviews on Google
          </LinkButton>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-forest-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <GoogleIcon size={26} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl text-forest-950">{data.rating.toFixed(1)}</span>
              <div className="flex gap-0.5 text-gold-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <GlowStarIcon key={i} size={16} loop={false} className={i < Math.round(data.rating) ? "opacity-100" : "opacity-30"} />
                ))}
              </div>
            </div>
            <p className="text-xs text-charcoal-500">{data.reviewCount} Google reviews</p>
          </div>
        </div>
        <LinkButton href={data.mapsUrl} variant="outline" icon={false}>
          Read Our Google Reviews
        </LinkButton>
      </div>

      {data.reviews.length > 0 ? (
        <RevealGroup className="mt-6 grid gap-6 sm:grid-cols-2" stagger={0.08}>
          {data.reviews.map((r) => (
            <RevealItem
              key={r.id}
              className="rounded-3xl border border-forest-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(11,59,46,0.25)]"
            >
              <div className="flex gap-0.5 text-gold-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <GlowStarIcon key={i} size={14} loop={i < r.rating} className={i < r.rating ? "opacity-100" : "opacity-30"} />
                ))}
              </div>
              <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-charcoal-700">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                {r.authorPhotoUrl ? (
                  <Image
                    src={r.authorPhotoUrl}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-ivory-50"
                    style={{ backgroundColor: toneFor(r.authorName) }}
                  >
                    {initials(r.authorName)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                    {r.authorName}
                  </p>
                  <p className="text-xs text-charcoal-400">{r.relativeTime} · Google</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <p className="mt-6 text-sm text-charcoal-500">No Google reviews to show yet.</p>
      )}
    </div>
  );
}
