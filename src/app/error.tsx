"use client";

import { AlertTriangle } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { waLink } from "@/lib/config/site";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-ivory-50 px-6 text-center">
      <div>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-50 text-gold-700">
          <MotionIcon preset="wiggle">
            <AlertTriangle size={30} />
          </MotionIcon>
        </span>
        <h1 className="mt-6 font-display text-3xl text-forest-950">Something went wrong</h1>
        <p className="mt-3 max-w-md text-sm text-charcoal-500">
          Nothing lost on your end — just a hiccup on ours.{" "}
          {error.digest ? `Our team can look this up with reference ${error.digest}.` : "Please try again."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button onClick={() => unstable_retry()} variant="forest" icon={false}>
            Try again
          </Button>
          <LinkButton href="/" variant="outline">
            Back to Home
          </LinkButton>
        </div>
        <a
          href={waLink("Hi! I ran into an error on the website and could use some help.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-sm text-charcoal-500 hover:text-gold-700"
        >
          Still stuck? Message us on WhatsApp
        </a>
      </div>
    </section>
  );
}
