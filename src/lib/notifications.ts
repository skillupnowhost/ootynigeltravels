import { sendSms } from "@/lib/sms";

export async function sendBookingConfirmationSms(phone: string, bookingCode: string, amount: number | null): Promise<void> {
  const amountLine = amount != null ? ` Amount: ₹${amount.toLocaleString("en-IN")}.` : "";
  await sendSms(
    phone,
    `Your Ooty Naigal Travels booking ${bookingCode} is confirmed.${amountLine} Track it anytime at our website.`
  );
}
