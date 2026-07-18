import { Mail, MessageCircle, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { HeadsetPulseIcon, ClockHandsIcon, MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import { site, waLink } from "@/lib/config/site";

const CONTACT_POINTS: {
  icon: React.ReactNode;
  label: string;
  value: string;
  altValue?: string;
  href?: string;
}[] = [
  {
    icon: <Phone size={18} />,
    label: "Call us",
    value: site.phone,
    altValue: site.altPhone,
    href: site.phoneHref,
  },
  {
    icon: <MessageCircle size={18} />,
    label: "WhatsApp",
    value: "Chat instantly",
    href: waLink(`Hello ${site.name}, I'd like to plan a trip.`),
  },
  {
    icon: <Mail size={18} />,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: <ClockHandsIcon size={18} loop={false} />,
    label: "Hours",
    value: site.hours,
  },
];

export function ContactTeaser() {
  return (
    <section className="container-luxe py-24">
      <Reveal>
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-gold-200/70 bg-gradient-to-br from-ivory-50 via-white to-gold-50 px-8 py-16 shadow-[0_20px_60px_-30px_rgba(11,59,46,0.25)] transition-shadow duration-500 hover:shadow-[0_40px_90px_-35px_rgba(11,59,46,0.35)] sm:px-14 md:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-90"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(200,161,92,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(47,138,110,0.12), transparent 40%)",
            }}
          />
          <div className="relative text-center">
            <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 ring-1 ring-gold-200/70">
              <HeadsetPulseIcon size={28} />
            </span>
            <h2 className="font-display text-3xl leading-tight text-forest-950 sm:text-4xl md:text-5xl">
              Ready to plan your Ooty journey?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-charcoal-500">
              Tell us your dates and we&apos;ll shape an itinerary around them — no
              account required to get started.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <LinkButton href="/booking" variant="gold">
                Start a Booking
              </LinkButton>
              <LinkButton href="/contact" variant="outline" className="border-forest-200 text-forest-900 hover:border-gold-500 hover:bg-forest-50">
                Contact Us
              </LinkButton>
            </div>
          </div>

          <RevealGroup
            className="relative mt-12 grid gap-3 border-t border-forest-100 pt-10 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.08}
          >
            {CONTACT_POINTS.map((c) => {
              const content = (
                <div className="group/item flex items-center gap-3 rounded-2xl border border-forest-100 bg-white/70 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/60 hover:bg-white">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700">
                    <MotionIcon preset="ring">{c.icon}</MotionIcon>
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-[11px] uppercase tracking-wide text-charcoal-500">{c.label}</span>
                    <span className="block truncate text-sm font-medium text-forest-950">{c.value}</span>
                    {c.altValue && (
                      <span className="block truncate text-sm font-medium text-forest-950">{c.altValue}</span>
                    )}
                  </span>
                </div>
              );
              return (
                <RevealItem key={c.label}>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </RevealItem>
              );
            })}
          </RevealGroup>

          <p className="relative mt-6 flex items-center justify-center gap-2 text-center text-xs text-charcoal-500">
            <MapPinDropIcon size={14} loop={false} /> {site.address}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
