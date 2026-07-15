import type { Metadata } from "next";
import { PolicyPage } from "@/components/ui/PolicyPage";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  alternates: { canonical: "/cancellation-policy" },
};

export default function CancellationPolicyPage() {
  return (
    <PolicyPage
      title="Cancellation Policy"
      updated="July 2026"
      sections={[
        {
          heading: "Requesting a cancellation",
          body: [
            "You can request a cancellation any time from the Track Booking page, using your booking ID and the phone number the booking was made with. Our team confirms every cancellation request manually.",
          ],
        },
        {
          heading: "Cancellation windows",
          body: [
            "48 hours or more before travel: fee-free cancellation.",
            "24–48 hours before travel: a partial fee may apply, reflecting driver and vehicle allocation already made.",
            "Under 24 hours, or after the driver has been dispatched: cancellation fees are higher, since the vehicle is already committed.",
          ],
        },
        {
          heading: "Signature packages",
          body: [
            "Multi-day packages with hotel bookings included may carry additional cancellation terms passed through from the accommodation provider — these will be shared at the time of confirmation.",
          ],
        },
      ]}
    />
  );
}
