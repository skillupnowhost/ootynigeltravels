import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { ClockHandsIcon } from "@/components/ui/AnimatedIcons";
import { blogRepo } from "@/lib/db/queries/blog";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogRepo.getBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await blogRepo.getBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published_at,
    author: { "@type": "Organization", name: post.author ?? undefined },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow={post.category} title={post.title} seed={post.slug} variant="tea-rows" image={post.cover_image}>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-forest-300">
          <ClockHandsIcon size={16} className="text-gold-400" /> {post.read_minutes} min read · {formatDate(post.published_at)} · {post.author}
        </span>
      </PageHero>

      <article className="container-luxe max-w-2xl py-16">
        <Reveal>
          {post.content.split("\n\n").map((para, i) => (
            <p key={i} className="mb-6 text-base leading-relaxed text-charcoal-700">
              {para}
            </p>
          ))}
        </Reveal>
        {post.tags.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap gap-2 border-t border-forest-100 pt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-forest-100 px-3 py-1 text-xs font-medium text-forest-800 transition-colors duration-300 hover:bg-gold-200 hover:text-forest-950"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Reveal>
        )}
      </article>
    </>
  );
}
