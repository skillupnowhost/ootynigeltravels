import type { Metadata } from "next";
import Link from "next/link";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { packagesRepo } from "@/lib/db/queries/packages";
import { SERVICES } from "@/lib/data/services";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HTML Sitemap",
  description: "Browse Ooty Nigel Travels pages for taxi services, Ooty tour packages, Nilgiris destinations and travel guides.",
  alternates: { canonical: "/site-map" },
};

const CORE_LINKS = [
  ["Home", "/"],
  ["About Ooty Nigel Travels", "/about"],
  ["Plan Your Journey", "/booking"],
  ["Contact Us", "/contact"],
  ["Travel Guide", "/blog"],
  ["Frequently Asked Questions", "/faq"],
  ["Vehicle Fleet", "/fleet"],
  ["Guest Reviews", "/reviews"],
  ["Photo Gallery", "/gallery"],
] as const;

function LinkGroup({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-forest-950">{title}</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm font-medium text-forest-800 hover:text-gold-700 hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function SiteMapPage() {
  const [destinations, packages] = await Promise.all([destinationsRepo.list(true), packagesRepo.list(true)]);

  return (
    <section className="container-luxe max-w-5xl py-32">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">Explore</p>
      <h1 className="mt-3 font-display text-4xl text-forest-950">Ooty Nigel Travels sitemap</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal-500">
        Find Ooty taxi services, private tour packages, Nilgiris destinations and practical local travel guides.
      </p>

      <div className="mt-12 grid gap-12">
        <LinkGroup title="Plan your trip" links={CORE_LINKS} />
        <LinkGroup title="Taxi and travel services" links={SERVICES.map((service) => [service.name, `/services/${service.slug}`] as const)} />
        <LinkGroup title="Tour packages" links={packages.map((pkg) => [pkg.name, `/packages/${pkg.slug}`] as const)} />
        <LinkGroup title="Nilgiris destinations" links={destinations.map((destination) => [destination.name, `/destinations/${destination.slug}`] as const)} />
      </div>
    </section>
  );
}
