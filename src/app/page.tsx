import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TripStylesShowcase } from "@/components/home/TripStylesShowcase";
import { DestinationsShowcase } from "@/components/home/DestinationsShowcase";
import { AttractionsCarousel } from "@/components/home/AttractionsCarousel";
import { SignaturePackages } from "@/components/home/SignaturePackages";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { BlogHighlights } from "@/components/home/BlogHighlights";
import { ContactTeaser } from "@/components/home/ContactTeaser";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { listDestinationImages } from "@/lib/db/queries/destinationImages";
import { attractionsRepo } from "@/lib/db/queries/attractions";
import { listAttractionImages } from "@/lib/db/queries/attractionImages";
import { packagesRepo } from "@/lib/db/queries/packages";
import { blogRepo } from "@/lib/db/queries/blog";
import { getOotyWeather } from "@/lib/weather";
import { site } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${site.name} | ${site.tagline}`,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const destinations = destinationsRepo.list(true);
  const destinationsWithImages = destinations.map((d) => {
    const images = listDestinationImages(d.id, true).map((img) => ({ src: img.src, alt: img.alt }));
    return { ...d, images: images.length > 0 ? images : d.image ? [{ src: d.image, alt: d.name }] : [] };
  });
  const attractions = attractionsRepo.list(true);
  const attractionsWithImages = attractions.map((a) => ({
    ...a,
    images: listAttractionImages(a.id, true).map((img) => ({ src: img.src, alt: img.alt })),
  }));
  const packages = packagesRepo.list(true);
  const posts = blogRepo.list();
  const weather = await getOotyWeather();

  const destinationsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: destinationsWithImages.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: d.name,
        description: d.description ?? undefined,
        url: `${site.url}/destinations/${d.slug}`,
        image: d.images[0]?.src ? `${site.url}${d.images[0].src}` : undefined,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationsJsonLd) }} />
      <Hero destinations={destinations} packages={packages} theme={weather} />
      <TripStylesShowcase />
      <DestinationsShowcase destinations={destinationsWithImages} />
      <AttractionsCarousel attractions={attractionsWithImages} />
      <SignaturePackages packages={packages} />
      <GalleryPreview />
      <BlogHighlights posts={posts} />
      <ContactTeaser />
    </>
  );
}
