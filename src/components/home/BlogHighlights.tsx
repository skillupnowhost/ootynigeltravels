import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { ClockHandsIcon } from "@/components/ui/AnimatedIcons";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/lib/db/types";

export function BlogHighlights({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="bg-forest-50 py-24">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Travel Guide"
            title="Everything you need to plan the trip"
            description="Guides, tips, seasonal advice and local favourites — not generic listicles."
          />
          <Link
            href="/blog"
            className="group/link mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-900 hover:text-gold-700"
          >
            Read the guide{" "}
            <MotionIcon preset="bounce">
              <ArrowRight size={16} />
            </MotionIcon>
          </Link>
        </div>

        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3" stagger={0.1}>
          {posts.slice(0, 3).map((post) => (
            <RevealItem key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-3xl border border-forest-100 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_28px_60px_-30px_rgba(11,59,46,0.35)]"
              >
                <div className="relative h-36 overflow-hidden">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="scale-105 object-cover transition-transform duration-700 group-hover:scale-[1.15]"
                    />
                  ) : (
                    <ScenicArt
                      seed={post.slug}
                      className="h-full w-full scale-105 transition-transform duration-700 group-hover:scale-[1.15]"
                    />
                  )}
                </div>
                <div className="p-6">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                    <ClockHandsIcon size={13} loop={false} /> {post.read_minutes} min read ·{" "}
                    {formatDate(post.published_at)}
                  </span>
                  <h3 className="mt-3 font-display text-lg leading-snug text-forest-950 transition-colors group-hover:text-gold-700">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-charcoal-500">{post.excerpt}</p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
