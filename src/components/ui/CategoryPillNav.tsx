"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export interface PillCategory {
  slug: string;
  label: string;
  count: number;
}

export function CategoryPillNav({ categories, layoutId = "pill-active" }: { categories: PillCategory[]; layoutId?: string }) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`cat-${c.slug}`))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Only ever scrolls the horizontal pill strip itself (via scrollLeft) —
    // never scrollIntoView, which can mis-detect the nearest scroll container
    // through a `sticky` ancestor and yank the whole page's vertical scroll
    // back to top as the IntersectionObserver below fires on every scroll tick.
    const container = navRef.current;
    const btn = container?.querySelector<HTMLButtonElement>(`[data-slug="${active}"]`);
    if (!container || !btn) return;
    const btnLeft = btn.offsetLeft;
    const btnRight = btnLeft + btn.offsetWidth;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;
    if (btnLeft < viewLeft) {
      container.scrollTo({ left: Math.max(0, btnLeft - 16), behavior: "smooth" });
    } else if (btnRight > viewRight) {
      container.scrollTo({ left: btnRight - container.clientWidth + 16, behavior: "smooth" });
    }
  }, [active]);

  function scrollToCategory(slug: string) {
    document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(slug);
  }

  return (
    <div className="sticky top-[5.5rem] z-30 -mx-4 border-b border-forest-100 bg-ivory-50/90 px-4 py-3 backdrop-blur-md sm:top-24">
      <div ref={navRef} className="container-luxe flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            data-slug={c.slug}
            onClick={() => scrollToCategory(c.slug)}
            className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              active === c.slug ? "text-ivory-50" : "text-forest-800 hover:text-gold-700"
            }`}
          >
            {active === c.slug && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-forest-900"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">
              {c.label} <span className="opacity-60">({c.count})</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
