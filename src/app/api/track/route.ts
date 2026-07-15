import { NextResponse, type NextRequest } from "next/server";
import { getBookingByCode, listBookingsByPhone } from "@/lib/db/queries/bookings";
import { rateLimit } from "@/lib/auth/rateLimit";

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
    return NextResponse.json({ bookings: booking ? [booking] : [] });
  }
  if (phone) {
    const bookings = await listBookingsByPhone(phone);
    return NextResponse.json({ bookings });
  }
  return NextResponse.json({ error: "Provide a booking code or phone number." }, { status: 400 });
}
