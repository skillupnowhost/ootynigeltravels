import type { Metadata } from "next";
import { CheckCircle2, MessageCircle, Wrench } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { MaintenanceCarScene } from "@/components/ui/MaintenanceCarScene";
import { MaintenanceProgressBar } from "@/components/ui/MaintenanceProgressBar";
import { Reveal } from "@/components/ui/Reveal";
import { waLink } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Under Maintenance",
  description: "We're giving the site a quick tune-up. We'll be back on the road shortly.",
  robots: { index: false, follow: false },
};

const upgrades = ["Faster page loads", "Smoother booking flow", "Fresh trip photography"];

export default function MaintenancePage() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-ivory-50 py-14 text-forest-950 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-100/60 via-transparent to-transparent" />
      <div className="container-luxe relative text-center">
        <Reveal className="mx-auto max-w-xl">
          <div className="mx-auto w-full max-w-[340px] sm:max-w-[440px] md:max-w-[520px]">
            <MaintenanceCarScene />
          </div>

          <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-gold-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-700">
            <Wrench size={13} />
            Scheduled maintenance
          </span>
          <h1 className="mt-5 font-display text-4xl text-forest-950 sm:text-5xl">We&apos;re tuning up the engine</h1>
          <p className="mx-auto mt-4 max-w-md text-base text-charcoal-500">
            Our team is upgrading the site to serve you better. We&apos;ll be back on the road shortly — thanks for
            your patience.
          </p>

          <MaintenanceProgressBar className="mx-auto mt-7 max-w-xs" />

          <ul className="mx-auto mt-6 flex w-fit flex-col items-start gap-2">
            {upgrades.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-charcoal-500">
                <CheckCircle2 size={16} className="shrink-0 text-forest-600" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <LinkButton href="/" variant="gold">
              Try Again
            </LinkButton>
          </div>

          <a
            href={waLink("Hi! I saw the site is under maintenance and could use some help.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-charcoal-500 transition-colors hover:text-gold-700"
          >
            <MessageCircle size={14} />
            Need urgent help? Message us on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
