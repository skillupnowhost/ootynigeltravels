import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { CompassIcon } from "@/components/ui/AnimatedIcons";
import { Reveal } from "@/components/ui/Reveal";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-forest-950 text-ivory-50">
      <ScenicArt seed="404-lost-in-the-hills" variant="mountains" className="absolute inset-0 h-full w-full opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/85 to-forest-950/70" />
      <div className="container-luxe relative text-center">
        <Reveal>
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/30 bg-forest-900/60 text-gold-400">
            <CompassIcon size={40} />
          </span>
          <h1 className="mt-8 font-display text-6xl text-ivory-50 sm:text-7xl">404</h1>
          <p className="mt-4 text-lg text-forest-200">
            This route doesn&apos;t exist — but the Nilgiris are still worth exploring.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-forest-300">
            Looks like this trail wandered off the map. Let&apos;s get you back on a road we know well.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <LinkButton href="/" variant="gold">
              Back to Home
            </LinkButton>
            <LinkButton
              href="/packages"
              variant="outline"
              className="border-forest-600 text-ivory-50 hover:border-gold-500 hover:bg-forest-800"
            >
              Browse Packages
            </LinkButton>
          </div>
          <Link href="/contact" className="mt-6 inline-block text-sm text-forest-300 hover:text-gold-400">
            Or let us know what you were looking for
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
