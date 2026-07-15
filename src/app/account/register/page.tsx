import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { RegisterForm } from "@/components/forms/AuthForms";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { Reveal } from "@/components/ui/Reveal";
import { ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";

export const metadata: Metadata = {
  title: "Create Account",
  alternates: { canonical: "/account/register" },
};

export default function RegisterPage() {
  return (
    <>
      <PageHero eyebrow="Account" title="Create your account" seed="register-hero" />
      <section className="container-luxe max-w-4xl py-16">
        <Reveal>
          <div className="grid overflow-hidden rounded-3xl border border-forest-100 bg-white shadow-[0_20px_60px_-30px_rgba(11,59,46,0.35)] md:grid-cols-2">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-forest-950 p-8 text-ivory-50 md:flex">
              <ScenicArt seed="register-panel" variant="mountains" className="absolute inset-0 h-full w-full opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/80 to-forest-950/40" />
              <div className="relative">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
                  Join us
                </span>
                <p className="mt-3 font-display text-2xl leading-snug text-ivory-50">
                  Create an account to track bookings and travel faster next time.
                </p>
              </div>
              <div className="relative flex items-center gap-2 text-sm text-forest-200">
                <ShieldBadgeIcon size={20} className="text-gold-400" />
                Secure, private, and always in your control.
              </div>
            </div>
            <div className="p-8 sm:p-10">
              <RegisterForm />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
