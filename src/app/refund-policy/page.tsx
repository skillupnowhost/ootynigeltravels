import type { Metadata } from "next";
import { PolicyPage } from "@/components/ui/PolicyPage";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      updated="July 2026"
      sections={[
        {
          heading: "Eligible refunds",
          body: [
            "Where a cancellation falls within our fee-free window (see our Cancellation Policy), any amount already paid is refunded in full to the original payment method.",
            "Where a partial cancellation fee applies, the remainder is refunded.",
          ],
        },
        {
          heading: "Processing time",
          body: [
            "Approved refunds are processed within 5–7 business days, depending on your bank or payment provider.",
          ],
        },
        {
          heading: "Service issues",
          body: [
            `If a trip did not match what was confirmed — wrong vehicle, no-show driver, or a significant service failure — contact us at ${site.email} or ${site.phone} within 48 hours and we'll review it individually.`,
          ],
        },
      ]}
    />
  );
}
