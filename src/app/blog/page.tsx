import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { RevealGroup, RevealItem, Reveal } from "@/components/ui/Reveal";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { CategoryPillNav } from "@/components/ui/CategoryPillNav";
import { ClockHandsIcon, HeadsetPulseIcon } from "@/components/ui/AnimatedIcons";
import { blogRepo } from "@/lib/db/queries/blog";
import { formatDate } from "@/lib/format";
import { BLOG_CATEGORIES } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Travel Guide",
  description: "Guides, tips, seasonal advice, photo spots and local favourites for planning your Nilgiris trip.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = blogRepo.list();

  const groups = BLOG_CATEGORIES.map((category) => ({
    slug: category.toLowerCase().replace(/\s+/g, "-"),
    label: category,
    posts: posts.filter((p) => p.category === category),
  })).filter((g) => g.posts.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Travel Guide"
        title="Everything you need to plan the trip"
        description="Practical, locally-written guides — seasonal advice, photo spots, food and the small details that make a Nilgiris trip effortless."
        seed="blog-hero"
        variant="tea-rows"
      />

      <CategoryPillNav
        layoutId="blog-pill-active"
        categories={groups.map((g) => ({ slug: g.slug, label: g.label, count: g.posts.length }))}
      />

      {groups.map((g) => (
        <section id={`cat-${g.slug}`} key={g.slug} className="scroll-mt-40 py-14 sm:py-16">
          <div className="container-luxe">
            <h2 className="mb-6 font-display text-2xl text-forest-950 sm:text-3xl">{g.label}</h2>
            <RevealGroup className="grid gap-6 md:grid-cols-3" stagger={0.1}>
              {g.posts.map((post) => (
                <RevealItem key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block overflow-hidden rounded-3xl border border-forest-100 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-200 hover:shadow-[0_28px_60px_-30px_rgba(11,59,46,0.35)]"
                  >
                    <div className="relative h-40 overflow-hidden">
                      {post.cover_image ? (
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          sizes="(min-width: 768px) 33vw, 100vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <ScenicArt seed={post.slug} className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-110" />
                      )}
                    </div>
                    <div className="p-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                        <ClockHandsIcon size={14} className="text-gold-700" loop={false} /> {post.read_minutes} min read · {formatDate(post.published_at)}
                      </span>
                      <h3 className="mt-3 font-display text-lg leading-snug text-forest-950 transition-colors duration-300 group-hover:text-forest-700">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-charcoal-500">{post.excerpt}</p>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ))}

      <section className="border-t border-forest-100 bg-forest-50 py-16">
        <div className="container-luxe">
          <Reveal>
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-forest-100 bg-white p-8 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest-900 text-gold-400">
                  <HeadsetPulseIcon size={22} />
                </span>
                <div>
                  <h3 className="font-display text-lg text-forest-950">Still have questions?</h3>
                  <p className="text-sm text-charcoal-500">Booking, payments, cancellations and more — answered in one place.</p>
                </div>
              </div>
              <Link
                href="/faq"
                className="group/link inline-flex shrink-0 items-center gap-1.5 rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-ivory-50 transition-colors hover:bg-gold-600 hover:text-forest-950"
              >
                Browse FAQs
                <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
