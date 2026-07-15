"use client";

import { Search } from "lucide-react";
import { googleImagesSearchUrl } from "@/lib/googleSearch";

export function ExploreButton({ placeName, className = "" }: { placeName: string; className?: string }) {
  return (
    <a
      href={googleImagesSearchUrl(placeName)}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(e) => e.stopPropagation()}
      aria-label={`Explore more photos of ${placeName} on Google Images (opens in a new tab)`}
      className={`inline-flex items-center gap-1.5 rounded-full bg-forest-900/90 p-2 text-xs font-semibold text-ivory-50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-600 hover:text-forest-950 sm:px-3.5 sm:py-2 ${className}`}
    >
      <Search size={13} />
      <span className="hidden sm:inline">Explore</span>
    </a>
  );
}
