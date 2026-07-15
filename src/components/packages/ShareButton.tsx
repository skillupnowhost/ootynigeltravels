"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";

export function ShareButton({
  title,
  text,
  url,
  className = "",
}: {
  title: string;
  text?: string;
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: fullUrl });
        return;
      } catch {
        // user cancelled the native share sheet — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <IconButton
      onClick={handleShare}
      aria-label="Share this package"
      title={copied ? "Link copied" : "Share"}
      className={className}
    >
      <MotionIcon preset="tilt">{copied ? <Check size={17} /> : <Share2 size={16} />}</MotionIcon>
    </IconButton>
  );
}
