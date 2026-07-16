import { unstable_cache } from "next/cache";

export interface GoogleReview {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  authorProfileUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime: string;
}

export interface GooglePlaceReviews {
  rating: number;
  reviewCount: number;
  mapsUrl: string;
  reviews: GoogleReview[];
}

interface PlacesApiReview {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text?: { text: string };
  originalText?: { text: string };
  publishTime: string;
  authorAttribution?: {
    displayName: string;
    photoUri?: string;
    uri?: string;
  };
}

interface PlacesApiResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesApiReview[];
}

/** Google Maps deep link for a place — works even without an API key. */
export function googleMapsPlaceUrl(placeId: string): string {
  return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
}

async function fetchGoogleReviews(): Promise<GooglePlaceReviews | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId || apiKey === "change-me" || placeId === "change-me") return null;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as PlacesApiResponse;
    return {
      rating: data.rating ?? 5,
      reviewCount: data.userRatingCount ?? 0,
      mapsUrl: data.googleMapsUri ?? googleMapsPlaceUrl(placeId),
      reviews: (data.reviews ?? []).map((r) => ({
        id: r.name,
        authorName: r.authorAttribution?.displayName ?? "Google user",
        authorPhotoUrl: r.authorAttribution?.photoUri ?? null,
        authorProfileUrl: r.authorAttribution?.uri ?? null,
        rating: r.rating,
        text: r.text?.text ?? r.originalText?.text ?? "",
        relativeTime: r.relativePublishTimeDescription,
        publishTime: r.publishTime,
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Places API (New) returns at most 5 "most relevant" reviews per place — there's no
 * pagination for more. Cached via unstable_cache (not fetch's `next.revalidate`) because
 * this page renders with `force-dynamic`, which forces plain fetch() calls to `no-store`.
 */
export const getGoogleReviews = unstable_cache(fetchGoogleReviews, ["google-place-reviews"], {
  revalidate: 1800,
  tags: ["google-reviews"],
});
