import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { CrashScene } from "@/components/ui/CrashScene";
import { Reveal } from "@/components/ui/Reveal";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-forest-950 py-16 text-ivory-50">
      <ScenicArt seed="404-lost-in-the-hills" variant="mountains" className="absolute inset-0 h-full w-full opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/85 to-forest-950/70" />
      <div className="container-luxe relative text-center">
        <Reveal className="mx-auto max-w-xl">
          <div className="mx-auto w-full max-w-[300px] sm:max-w-[380px] md:max-w-[440px]">
            <CrashScene className="h-auto w-full drop-shadow-[0_20px_40px_rgba(7,31,24,0.55)]" />
          </div>
          <h1 className="mt-4 font-display text-6xl text-ivory-50 sm:text-7xl">404</h1>
          <p className="mt-4 text-lg text-forest-200">
            Looks like we took a wrong turn and clipped a signpost.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-forest-300">
            The page you&apos;re after doesn&apos;t exist — but the Nilgiris are still worth exploring. Let&apos;s get you
            back on a road we know well.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <LinkButton href="/" variant="gold">
              Back to Home
            </LinkButton>
            <LinkButton href="/packages" variant="outline-invert">
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
