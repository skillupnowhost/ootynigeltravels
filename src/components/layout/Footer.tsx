import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, ArrowUpRight } from "lucide-react";
import { WhatsAppGlyphIcon, InstagramIcon, FacebookIcon, YoutubeIcon, TelegramIcon } from "@/components/ui/BrandIcons";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { site, waLink } from "@/lib/config/site";

const SOCIAL_LINKS = [
  { href: site.social.instagram, icon: InstagramIcon, label: "Instagram" },
  { href: site.social.facebook, icon: FacebookIcon, label: "Facebook" },
  { href: site.social.youtube, icon: YoutubeIcon, label: "YouTube" },
  { href: site.social.telegram, icon: TelegramIcon, label: "Telegram" },
];

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/packages", label: "Signature Packages" },
      { href: "/destinations", label: "Destinations" },
      { href: "/gallery", label: "Gallery" },
      { href: "/reviews", label: "Reviews" },
      { href: "/booking", label: "Plan Your Journey" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/blog", label: "Travel Guide" },
      { href: "/faq", label: "FAQs" },
      { href: "/contact", label: "Contact" },
      { href: "/track", label: "Track a Booking" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cancellation-policy", label: "Cancellation Policy" },
      { href: "/refund-policy", label: "Refund Policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-forest-800 bg-forest-950 text-ivory-100">
      <div
        className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(200,161,92,0.35), transparent 70%)" }}
        aria-hidden
      />

      <div className="container-luxe relative pt-14 sm:pt-16">
        <Reveal className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/brand/logo-full.png"
                alt="Ooty Nigel Travels — Luxury Journeys, Timeless Memories"
                width={1024}
                height={1024}
                className="h-20 w-20 sm:h-24 sm:w-24"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-forest-200">
              {site.description}
            </p>
          </div>
          <LinkButton href="/booking" variant="gold" className="shrink-0">
            Plan Your Journey
          </LinkButton>
        </Reveal>

        <Reveal delay={0.1} className="relative mt-10 sm:mt-12">
          <div className="h-[3px] w-full road-texture animate-road-dash opacity-80" />
          <div className="pointer-events-none absolute inset-x-0 -top-3 h-6 overflow-hidden sm:-top-4 sm:h-8" aria-hidden>
            <div className="absolute w-11 sm:w-[59px] animate-drive-loop">
              <Image
                src="/images/brand/car-footer.png"
                alt=""
                width={640}
                height={348}
                className="h-6 w-11 animate-bob drop-shadow-[0_6px_8px_rgba(0,0,0,0.4)] sm:h-8 sm:w-[59px]"
              />
            </div>
          </div>
        </Reveal>

        <RevealGroup
          className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-4 sm:gap-x-8 sm:py-14"
          stagger={0.1}
        >
          {columns.map((col) => (
            <RevealItem key={col.title} className="min-w-0">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link inline-flex items-center gap-1 text-sm text-forest-200 transition-colors hover:text-ivory-50"
                    >
                      <span className="border-b border-transparent pb-0.5 transition-colors group-hover/link:border-gold-500/60">
                        {link.label}
                      </span>
                      <ArrowUpRight
                        size={13}
                        className="-translate-x-1 text-gold-400 opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}

          <RevealItem className="col-span-2 min-w-0 sm:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
              Contact
            </h3>
            <div className="mt-5 rounded-2xl border border-forest-800 bg-forest-900/40 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500/40">
              <ul className="space-y-3 text-sm text-forest-200">
                <li className="flex items-start gap-2">
                  <MotionIcon preset="ring" className="mt-0.5 shrink-0 text-gold-400">
                    <Phone size={16} />
                  </MotionIcon>
                  <span className="flex flex-col gap-1">
                    <a href={site.phoneHref} className="hover:text-ivory-50">{site.phone}</a>
                    <a href={site.altPhoneHref} className="hover:text-ivory-50">{site.altPhone}</a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MotionIcon preset="wiggle" className="mt-0.5 shrink-0 text-gold-400">
                    <Mail size={16} />
                  </MotionIcon>
                  <a href={`mailto:${site.email}`} className="break-all hover:text-ivory-50">{site.email}</a>
                </li>
                <li className="flex items-start gap-2 text-gold-400">
                  <MapPinDropIcon size={17} className="mt-0.5 shrink-0" loop={false} />
                  <span className="text-forest-200">{site.address}</span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={site.phoneHref}
                  aria-label={`Call ${site.name} at ${site.phone}`}
                  title={site.phone}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forest-700 bg-forest-950/60 text-gold-300 backdrop-blur-md transition-all hover:border-gold-400 hover:text-gold-200"
                >
                  <MotionIcon preset="ring">
                    <Phone size={16} />
                  </MotionIcon>
                </a>
                <a
                  href={waLink(`Hi ${site.name}, I'd like to plan a trip to Ooty.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with us on WhatsApp"
                  title="Chat on WhatsApp"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#25D366]/40 bg-[#25D366]/10 text-[#3fe089] backdrop-blur-md transition-all hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
                >
                  <MotionIcon preset="pulse" loop>
                    <WhatsAppGlyphIcon size={16} />
                  </MotionIcon>
                </a>
                <Link
                  href="/contact"
                  className="group/cta inline-flex items-center gap-1 rounded-full border border-gold-500/50 px-4 py-2 text-xs font-semibold text-gold-300 transition-all duration-300 hover:border-gold-400 hover:bg-gold-500/10 hover:text-gold-200"
                >
                  Get in Touch
                  <ArrowUpRight
                    size={13}
                    className="transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>

      <div className="relative border-t border-forest-800">
        <div className="container-luxe flex flex-col items-center justify-between gap-4 py-6 text-center text-xs text-forest-300 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved. Made with{" "}
            <span className="text-gold-400" aria-label="love">♥</span> for Nilgiri travel lovers.
          </p>
          <div className="flex items-center gap-2.5">
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-forest-700 text-forest-300 transition-colors hover:border-gold-400 hover:text-gold-300"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
