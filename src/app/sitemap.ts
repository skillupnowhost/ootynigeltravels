import type { MetadataRoute } from "next";
import { site } from "@/lib/config/site";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { packagesRepo } from "@/lib/db/queries/packages";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { blogRepo } from "@/lib/db/queries/blog";

const STATIC_ROUTES = [
  "",
  "/about",
  "/fleet",
  "/packages",
  "/destinations",
  "/drivers",
  "/gallery",
  "/reviews",
  "/blog",
  "/faq",
  "/contact",
  "/booking",
  "/track",
  "/privacy-policy",
  "/terms",
  "/cancellation-policy",
  "/refund-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const [fleet, packages, destinations, blog] = await Promise.all([
    fleetRepo.list(true).catch(() => []),
    packagesRepo.list(true).catch(() => []),
    destinationsRepo.list(true).catch(() => []),
    blogRepo.list().catch(() => []),
  ]);

  const fleetEntries: MetadataRoute.Sitemap = fleet.map((v) => ({
    url: `${site.url}/fleet/${v.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const packageEntries: MetadataRoute.Sitemap = packages.map((p) => ({
    url: `${site.url}/packages/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const destinationEntries: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${site.url}/destinations/${d.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = blog.map((b) => ({
    url: `${site.url}/blog/${b.slug}`,
    lastModified: b.published_at,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [...staticEntries, ...fleetEntries, ...packageEntries, ...destinationEntries, ...blogEntries];
}
