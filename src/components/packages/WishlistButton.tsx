"use client";

import { Heart } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { useWishlist } from "@/hooks/useWishlist";

export function WishlistButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { saved, toggle } = useWishlist(slug);

  return (
    <IconButton
      active={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={className}
    >
      <MotionIcon preset="pop">
        <Heart size={17} fill={saved ? "currentColor" : "none"} />
      </MotionIcon>
    </IconButton>
  );
}
