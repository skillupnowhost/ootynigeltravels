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
  const packages = packagesRepo.list(true);
  const posts = blogRepo.list();
  const weather = await getOotyWeather();

  return (
    <>
      <Hero destinations={destinations} packages={packages} theme={weather} />
      <TripStylesShowcase />
      <DestinationsShowcase destinations={destinations} />
      <AttractionsCarousel />
      <SignaturePackages packages={packages} />
      <GalleryPreview />
      <BlogHighlights posts={posts} />
      <ContactTeaser />
    </>
  );
}
