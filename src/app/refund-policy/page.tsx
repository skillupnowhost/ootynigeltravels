import type { Metadata } from "next";
import { PolicyPage } from "@/components/ui/PolicyPage";
import { WalletIcon, ClockHandsIcon, HeadsetPulseIcon } from "@/components/ui/AnimatedIcons";
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
      icon={<WalletIcon size={16} loop={false} className="text-gold-400" />}
      scenicVariant="lake"
      badge="Eligible refunds, processed without the runaround"
      highlights={[
        { icon: <WalletIcon size={18} loop={false} />, label: "Refunded to your original payment method" },
        { icon: <ClockHandsIcon size={18} loop={false} />, label: "Processed within 5–7 business days" },
        { icon: <HeadsetPulseIcon size={18} loop={false} />, label: "48-hour window to flag service issues" },
      ]}
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
