import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { requireUser } from "@/lib/auth/rbac";
import { logoutAction } from "@/lib/actions/account";
import { listBookingsForCustomer } from "@/lib/db/queries/bookings";
import { formatDate, formatINR } from "@/lib/format";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { CalendarCheckIcon, CarDriveIcon, MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import { CancelBookingButton } from "@/components/account/CancelBookingButton";
import { LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const user = await requireUser();
  const bookings = listBookingsForCustomer(user.id);

  return (
    <>
      <PageHero eyebrow="My Account" title={`Welcome back, ${user.name.split(" ")[0]}`} seed="account-hero" />

      <section className="container-luxe py-16">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <Reveal>
            <div className="h-fit rounded-3xl border border-forest-100 bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-900 text-base font-semibold text-gold-400">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
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
            <h2 className="font-display text-xl text-forest-950">Your bookings</h2>
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
                {bookings.map((b) => (
                  <RevealItem key={b.id}>
                    <div className="rounded-2xl border border-forest-100 bg-white p-6 transition-shadow duration-300 hover:shadow-[0_16px_40px_-24px_rgba(11,59,46,0.35)]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 font-display text-lg text-forest-950">
                          <CarDriveIcon size={20} className="text-forest-600" />
                          {b.booking_code}
                        </p>
                        <span className="rounded-full bg-forest-900 px-3 py-1 text-xs font-semibold text-ivory-50">
                          {b.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-charcoal-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarCheckIcon size={16} className="text-forest-500" loop={false} /> {formatDate(b.travel_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPinDropIcon size={16} className="text-forest-500" loop={false} /> {b.pickup_location}
                        </span>
                      </div>
                      <p className="mt-3 font-display text-base text-forest-950">
                        {formatINR(b.estimate_amount)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-4">
                        <a
                          href={`/track?code=${b.booking_code}`}
                          className="inline-block text-xs font-semibold text-gold-700 hover:underline"
                        >
                          View full status
                        </a>
                        {b.cancel_requested === 1 ? (
                          <p className="text-xs font-semibold text-gold-700">Cancellation requested</p>
                        ) : (
                          !["Completed", "Cancelled"].includes(b.status) && (
                            <CancelBookingButton code={b.booking_code} phone={user.phone} />
                          )
                        )}
                      </div>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
