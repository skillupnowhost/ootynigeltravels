import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { requireUser } from "@/lib/auth/rbac";
import { logoutAction } from "@/lib/actions/account";
import { listBookingsForCustomer } from "@/lib/db/queries/bookings";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { BookingCard } from "@/components/account/BookingCard";
import { AvatarUploader } from "@/components/account/AvatarUploader";
import { EditProfileForm } from "@/components/account/EditProfileForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { LogOut, MapPinned } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const user = await requireUser();
  const bookings = await listBookingsForCustomer(user.id);

  return (
    <>
      <PageHero eyebrow="My Account" title={`Welcome back, ${user.name.split(" ")[0]}`} seed="account-hero" />

      <section className="container-luxe py-16">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <Reveal>
            <div className="h-fit rounded-3xl border border-forest-100 bg-white p-6">
              <div className="flex items-center gap-3">
                <AvatarUploader name={user.name} avatar={user.avatar} />
                <div>
                  <p className="font-display text-base text-forest-950">{user.name}</p>
                  <p className="text-xs text-charcoal-500">{user.phone}</p>
                </div>
              </div>
              {user.email && <p className="mt-4 text-sm text-charcoal-500">{user.email}</p>}
              <form action={logoutAction} className="mt-6 border-t border-forest-100 pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-500 hover:text-red-600"
                >
                  <MotionIcon preset="tilt">
                    <LogOut size={16} />
                  </MotionIcon>
                  Sign out
                </button>
              </form>
            </div>
          </Reveal>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl text-forest-950">Your bookings</h2>
              {bookings.length > 0 && (
                <Link
                  href="/account/trips"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:underline"
                >
                  <MapPinned size={15} />
                  View all trips
                </Link>
              )}
            </div>
            {bookings.length === 0 ? (
              <p className="mt-4 text-sm text-charcoal-500">
                No bookings yet — head to our{" "}
                <a href="/booking" className="font-semibold text-forest-900 hover:text-gold-700">
                  booking page
                </a>{" "}
                to plan your first trip.
              </p>
            ) : (
              <RevealGroup className="mt-6 space-y-4">
                {bookings.slice(0, 5).map((b) => (
                  <BookingCard key={b.id} booking={b} phone={user.phone} />
                ))}
              </RevealGroup>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border border-forest-100 bg-white p-6 sm:p-8">
              <h2 className="font-display text-xl text-forest-950">Account details</h2>
              <div className="mt-6">
                <EditProfileForm user={user} />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-3xl border border-forest-100 bg-white p-6 sm:p-8">
              <h2 className="font-display text-xl text-forest-950">Change password</h2>
              <div className="mt-6">
                <ChangePasswordForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
