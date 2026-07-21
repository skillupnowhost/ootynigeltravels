import { NextResponse, type NextRequest } from "next/server";
import { getBookingByCode, listBookingsByPhone } from "@/lib/db/queries/bookings";
import { listTripRequestsByPhone } from "@/lib/db/queries/tripRequests";
import { rateLimit } from "@/lib/auth/rateLimit";

/**
 * Phone numbers are stored as E.164 (any country). Guests tracking a trip may
 * type their number with or without the leading `+`; a bare 10-digit number
 * is assumed Indian (the site's primary market) since that's what the old
 * India-only format used to store.
 */
function normalizeTrackPhone(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("+")) return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  return trimmed;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`track:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests — please slow down." }, { status: 429 });
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code")?.trim();
  const phone = searchParams.get("phone")?.trim();

  if (code) {
    const booking = await getBookingByCode(code);
    return NextResponse.json({ bookings: booking ? [booking] : [], tripRequests: [] });
  }
  if (phone) {
    const normalized = normalizeTrackPhone(phone);
    const [bookings, tripRequests] = await Promise.all([
      listBookingsByPhone(normalized),
      listTripRequestsByPhone(normalized),
    ]);
    return NextResponse.json({ bookings, tripRequests });
  }
  return NextResponse.json({ error: "Provide a booking code or phone number." }, { status: 400 });
}
