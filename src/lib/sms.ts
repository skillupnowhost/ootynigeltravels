import twilio from "twilio";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SMS_FROM = process.env.TWILIO_SMS_FROM;
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

const client = ACCOUNT_SID && AUTH_TOKEN ? twilio(ACCOUNT_SID, AUTH_TOKEN) : null;

/** Indian 10-digit mobile numbers (the only format this app collects) → E.164. */
function toE164India(phone: string): string {
  return phone.startsWith("+") ? phone : `+91${phone}`;
}

/**
 * Single gate all outbound guest messaging goes through (booking
 * confirmations, quotations). Tries WhatsApp first, falls back to SMS, and
 * falls back further to a console log when Twilio isn't configured — so the
 * app stays fully testable without a live account. Throws only if every
 * configured channel fails, so callers can surface a real error to the user.
 */
export async function sendSms(phone: string, message: string): Promise<void> {
  if (!client) {
    console.log(`[SMS -> ${phone}] ${message}`);
    return;
  }

  const to = toE164India(phone);
  const errors: string[] = [];

  if (WHATSAPP_FROM) {
    try {
      await client.messages.create({ from: WHATSAPP_FROM, to: `whatsapp:${to}`, body: message });
      return;
    } catch (err) {
      errors.push(`WhatsApp: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (SMS_FROM) {
    try {
      await client.messages.create({ from: SMS_FROM, to, body: message });
      return;
    } catch (err) {
      errors.push(`SMS: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (errors.length === 0) {
    // Twilio is configured (ACCOUNT_SID/AUTH_TOKEN set) but neither a WhatsApp nor SMS sender was set.
    throw new Error("Twilio is configured but no TWILIO_WHATSAPP_FROM or TWILIO_SMS_FROM sender is set.");
  }
  throw new Error(`Failed to deliver message to ${to} — ${errors.join("; ")}`);
}
