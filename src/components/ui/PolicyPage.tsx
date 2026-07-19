"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { PageHero } from "./PageHero";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { ShieldBadgeIcon } from "./AnimatedIcons";
import type { ScenicVariant } from "./ScenicArt";

export interface PolicySection {
  heading: string;
  body: string[];
}

export interface PolicyHighlight {
  icon: ReactNode;
  label: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function PolicyPage({
  title,
  eyebrow = "Legal",
  updated,
  icon,
  scenicVariant,
  badge = "Written in plain language, reviewed regularly",
  highlights,
  sections,
}: {
  title: string;
  eyebrow?: string;
  updated: string;
  icon?: ReactNode;
  scenicVariant?: ScenicVariant;
  badge?: string;
  highlights?: PolicyHighlight[];
  sections: PolicySection[];
}) {
  const articleRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(() => slugify(sections[0]?.heading ?? ""));
  const [showTop, setShowTop] = useState(false);

  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(slugify(s.heading)))
      .filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"
        style={{ scaleX: progress }}
      />

      <PageHero eyebrow={eyebrow} title={title} description={`Last updated ${updated}`} seed={title} variant={scenicVariant}>
        <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-forest-700/60 bg-forest-900/40 px-4 py-2 text-xs font-medium text-forest-200">
          {icon ?? <ShieldBadgeIcon size={16} loop={false} className="text-gold-400" />}
          {badge}
        </div>

        {highlights && highlights.length > 0 && (
          <RevealGroup className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3" stagger={0.08}>
            {highlights.map((h) => (
              <RevealItem key={h.label}>
                <div className="flex h-full items-center gap-3 rounded-2xl border border-forest-700/50 bg-forest-900/30 px-4 py-3.5 text-sm text-forest-100 backdrop-blur-sm transition-colors hover:border-gold-500/40">
                  <span className="shrink-0 text-gold-400">{h.icon}</span>
                  <span>{h.label}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </PageHero>

      <article ref={articleRef} className="container-luxe py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          {sections.length > 1 && (
            <nav aria-label="Sections on this page" className="lg:sticky lg:top-28 lg:self-start">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal-500">On this page</p>
              <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-l lg:border-forest-100 lg:pb-0">
                {sections.map((section) => {
                  const id = slugify(section.heading);
                  const active = activeId === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors lg:-ml-px lg:rounded-none lg:border-l-2 lg:py-1.5 lg:pl-4 ${
                        active
                          ? "bg-forest-900 text-ivory-50 lg:bg-transparent lg:border-gold-600 lg:font-medium lg:text-forest-950"
                          : "bg-forest-50 text-charcoal-500 lg:border-transparent lg:bg-transparent hover:text-gold-700"
                      }`}
                    >
                      {section.heading}
                    </a>
                  );
                })}
              </div>
            </nav>
          )}

          <div className="max-w-3xl divide-y divide-forest-100">
            {sections.map((section, i) => (
              <Reveal key={section.heading}>
                <section id={slugify(section.heading)} className="scroll-mt-28 py-10 first:pt-0">
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-3xl text-gold-200 sm:text-4xl" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-xl text-forest-950 sm:text-2xl">{section.heading}</h2>
                  </div>
                  <div className="mt-4 space-y-4 sm:pl-[3.25rem]">
                    {section.body.map((para, j) => (
                      <p key={j} className="text-base leading-relaxed text-charcoal-700">
                        {para}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </article>

      <AnimatePresence>
        {showTop && (
          <motion.button
            key="back-to-top"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest-700/60 bg-forest-950/90 text-gold-400 shadow-lg backdrop-blur-sm transition-colors hover:border-gold-500 hover:text-gold-300"
            aria-label="Back to top"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
