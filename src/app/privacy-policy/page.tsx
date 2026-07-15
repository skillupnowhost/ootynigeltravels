import type { Metadata } from "next";
import { PolicyPage } from "@/components/ui/PolicyPage";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      updated="July 2026"
      sections={[
        {
          heading: "What we collect",
          body: [
            "When you make a booking, register an account, or contact us, we collect your name, phone number, and — where you provide it — your email address and pickup location. Guest bookings do not require an account.",
            "We do not collect payment card details on this website; payments are arranged directly with our team.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "Your details are used to confirm and coordinate bookings, assign a driver and vehicle, respond to enquiries, and — if you create an account — to automatically link bookings you made as a guest with the same phone number to your account.",
            "We do not sell your personal information to third parties.",
          ],
        },
        {
          heading: "Account security",
          body: [
            `Account passwords are stored using one-way cryptographic hashing (scrypt) — we never store your password in plain text and cannot retrieve it. Sessions are managed via secure, signed cookies.`,
          ],
        },
        {
          heading: "Your rights",
          body: [
            `You can request a copy of the personal data we hold about you, or ask us to correct or delete it, by contacting us at ${site.email}.`,
          ],
        },
        {
          heading: "Contact",
          body: [`Questions about this policy can be sent to ${site.email} or ${site.phone}.`],
        },
      ]}
    />
  );
}
