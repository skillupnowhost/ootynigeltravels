"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { reorderGalleryImagesAction } from "@/lib/actions/adminContent";

export function GalleryReorderButtons({
  category,
  siblingIds,
  index,
}: {
  category: string;
  siblingIds: number[];
  index: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function move(dir: -1 | 1) {
    const next = [...siblingIds];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const fd = new FormData();
    fd.set("category", category);
    fd.set("ordered_ids", next.join(","));
    startTransition(async () => {
      await reorderGalleryImagesAction(fd);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-0.5">
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={index === 0 || isPending}
        className="rounded-lg p-1.5 text-charcoal-500 transition-colors hover:bg-forest-50 hover:text-forest-800 disabled:opacity-30"
        aria-label="Move earlier"
      >
        <ChevronUp size={15} />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        disabled={index === siblingIds.length - 1 || isPending}
        className="rounded-lg p-1.5 text-charcoal-500 transition-colors hover:bg-forest-50 hover:text-forest-800 disabled:opacity-30"
        aria-label="Move later"
      >
        <ChevronDown size={15} />
      </button>
    </div>
  );
}
