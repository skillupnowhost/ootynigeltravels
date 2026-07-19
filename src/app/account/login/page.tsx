import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { LoginForm } from "@/components/forms/AuthForms";
import { ScenicArt } from "@/components/ui/ScenicArt";
import { Reveal } from "@/components/ui/Reveal";
import { ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign In",
  alternates: { canonical: "/account/login" },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <>
      <PageHero eyebrow="Account" title="Sign in" seed="login-hero" />
      <section className="container-luxe max-w-4xl py-16">
        <Reveal>
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-forest-100 bg-white shadow-[0_20px_60px_-30px_rgba(11,59,46,0.35)] md:grid-cols-2">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-forest-950 p-8 text-ivory-50 md:flex">
              <ScenicArt seed="login-panel" variant="lake" className="absolute inset-0 h-full w-full opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/80 to-forest-950/40" />
              <div className="relative">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
                  Welcome back
                </span>
                <p className="mt-3 font-display text-2xl leading-snug text-ivory-50">
                  Your Nilgiris journeys, one sign-in away.
                </p>
              </div>
              <div className="relative flex items-center gap-2 text-sm text-forest-200">
                <ShieldBadgeIcon size={20} className="text-gold-400" />
                Secure, private, and always in your control.
              </div>
            </div>
            <div className="p-8 sm:p-10">
              <LoginForm />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
