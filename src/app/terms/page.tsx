import type { Metadata } from "next";
import { PolicyPage } from "@/components/ui/PolicyPage";
import { CalendarCheckIcon, CarDriveIcon, RoadIcon } from "@/components/ui/AnimatedIcons";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      updated="July 2026"
      icon={<CalendarCheckIcon size={16} loop={false} className="text-gold-400" />}
      scenicVariant="mountains"
      badge="The ground rules for booking and travelling with us"
      highlights={[
        { icon: <CalendarCheckIcon size={18} loop={false} />, label: "Bookings confirmed after availability check" },
        { icon: <CarDriveIcon size={18} loop={false} />, label: "Fair-use conduct expected on every trip" },
        { icon: <RoadIcon size={18} loop={false} />, label: "Not liable for delays outside our control" },
      ]}
      sections={[
        {
          heading: "Bookings",
          body: [
            "A booking submitted through this website is a request, confirmed by our team once vehicle and driver availability is verified. The estimate shown at the time of booking is indicative; final pricing is confirmed before your trip begins.",
          ],
        },
        {
          heading: "Guest bookings & accounts",
          body: [
            "You do not need an account to book. If you later create one using the same phone number, existing bookings are linked to that account automatically — no separate verification step is required.",
          ],
        },
        {
          heading: "Conduct on trips",
          body: [
            `${site.name} reserves the right to end a trip early, without refund, in cases of behaviour that endangers the driver, vehicle, or other passengers.`,
          ],
        },
        {
          heading: "Liability",
          body: [
            "We coordinate transport and itineraries in good faith but are not liable for delays caused by weather, road closures, or events outside our reasonable control.",
          ],
        },
        {
          heading: "Changes to these terms",
          body: ["We may update these terms from time to time; the date above reflects the last revision."],
        },
      ]}
    />
  );
}
