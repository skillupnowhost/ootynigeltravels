/** Google Images search URL for a place name — used by the homepage "Explore" buttons. */
export function googleImagesSearchUrl(placeName: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${placeName} images`)}`;
}
