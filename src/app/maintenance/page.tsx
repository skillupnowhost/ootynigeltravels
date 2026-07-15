import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { MaintenanceScene } from "@/components/ui/MaintenanceScene";
import { Reveal } from "@/components/ui/Reveal";
import { waLink } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Under Maintenance",
  description: "We're giving the site a quick tune-up. We'll be back on the road shortly.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-ivory-50 py-16 text-forest-950">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-100/60 via-transparent to-transparent" />
      <div className="container-luxe relative text-center">
        <Reveal className="mx-auto max-w-xl">
          <div className="mx-auto w-full max-w-[300px] sm:max-w-[380px] md:max-w-[440px]">
            <MaintenanceScene className="h-auto w-full drop-shadow-[0_16px_32px_rgba(23,24,26,0.12)]" />
          </div>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-700">
            Scheduled maintenance
          </span>
          <h1 className="mt-5 font-display text-4xl text-forest-950 sm:text-5xl">We&apos;re tuning up the engine</h1>
          <p className="mx-auto mt-4 max-w-md text-base text-charcoal-500">
            Our team is upgrading the site to serve you better. We&apos;ll be back on the road shortly — thanks for
            your patience.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <LinkButton href="/" variant="gold">
              Try Again
            </LinkButton>
          </div>
          <a
            href={waLink("Hi! I saw the site is under maintenance and could use some help.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm text-charcoal-500 hover:text-gold-700"
          >
            Need urgent help? Message us on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
