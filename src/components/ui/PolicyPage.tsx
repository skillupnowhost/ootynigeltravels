import { PageHero } from "./PageHero";
import { Reveal } from "./Reveal";
import { ShieldBadgeIcon } from "./AnimatedIcons";

export interface PolicySection {
  heading: string;
  body: string[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function PolicyPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: PolicySection[];
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={`Last updated ${updated}`} seed={title}>
        <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-forest-700/60 bg-forest-900/40 px-4 py-2 text-xs font-medium text-forest-200">
          <ShieldBadgeIcon size={16} loop={false} className="text-gold-400" />
          Written in plain language, reviewed regularly
        </div>
      </PageHero>

      <article className="container-luxe max-w-3xl py-16 sm:py-20">
        <Reveal>
          {sections.length > 1 && (
            <nav
              aria-label="Sections on this page"
              className="mb-12 flex flex-wrap gap-x-6 gap-y-2 border-b border-forest-100 pb-8 text-sm"
            >
              {sections.map((section) => (
                <a
                  key={section.heading}
                  href={`#${slugify(section.heading)}`}
                  className="text-charcoal-500 transition-colors hover:text-gold-700"
                >
                  {section.heading}
                </a>
              ))}
            </nav>
          )}

          <div className="divide-y divide-forest-100">
            {sections.map((section) => (
              <section
                key={section.heading}
                id={slugify(section.heading)}
                className="scroll-mt-28 py-8 first:pt-0"
              >
                <h2 className="font-display text-xl text-forest-950 sm:text-2xl">{section.heading}</h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((para, i) => (
                    <p key={i} className="text-base leading-relaxed text-charcoal-700">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Reveal>
      </article>
    </>
  );
}
