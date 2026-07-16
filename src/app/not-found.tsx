import Link from "next/link";
import { Compass, MapPinOff } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { CrashCarScene } from "@/components/ui/CrashCarScene";
import { Reveal } from "@/components/ui/Reveal";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/destinations", label: "Destinations" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-forest-950 py-14 text-ivory-50 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(200,161,92,0.08),transparent)]" />
      <div className="container-luxe relative text-center">
        <Reveal className="mx-auto max-w-xl">
          <div className="mx-auto w-full max-w-[340px] sm:max-w-[440px] md:max-w-[520px]">
            <CrashCarScene />
          </div>

          <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-300">
            <MapPinOff size={13} />
            Error 404
          </span>
          <h1 className="mt-4 font-display text-6xl text-ivory-50 sm:text-7xl">404</h1>
          <p className="mt-4 text-lg text-forest-200">
            Looks like we took a wrong turn and clipped a signpost.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-forest-300">
            The page you&apos;re after doesn&apos;t exist — but the Nilgiris are still worth exploring. Let&apos;s get
            you back on a road we know well.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <LinkButton href="/" variant="gold">
              Back to Home
            </LinkButton>
            <LinkButton href="/packages" variant="outline-invert">
              Browse Packages
            </LinkButton>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-ivory-50/15 px-3.5 py-1.5 text-xs text-forest-200 transition-colors hover:border-gold-400/50 hover:text-gold-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-forest-300 transition-colors hover:text-gold-400"
          >
            <Compass size={14} />
            Or let us know what you were looking for
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
