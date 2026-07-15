import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/auth/rateLimit";
import { packagesRepo } from "@/lib/db/queries/packages";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { listFaqs } from "@/lib/db/queries/faqs";
import { site } from "@/lib/config/site";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

const FALLBACK_MODEL = "meta-llama/llama-3.1-8b-instruct:free";

function buildSystemPrompt(): string {
  const packages = packagesRepo
    .list(true)
    .slice(0, 8)
    .map((p) => `- ${p.name} (${p.duration_label ?? "custom duration"}, from ₹${p.price_from}/-): ${p.summary ?? p.tagline ?? ""}`)
    .join("\n");

  const fleet = fleetRepo
    .list(true)
    .slice(0, 8)
    .map((v) => `- ${v.name} — ${v.category}, ${v.seats} seats, ₹${v.price_per_day}/day`)
    .join("\n");

  const destinations = destinationsRepo
    .list(true)
    .slice(0, 10)
    .map((d) => `- ${d.name}${d.distance_from_ooty ? ` (${d.distance_from_ooty} from Ooty)` : ""}`)
    .join("\n");

  const faqs = listFaqs()
    .slice(0, 10)
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  return `You are the friendly, concise travel concierge for ${site.name}, a private chauffeured travel company in Ooty (Udhagamandalam) and the Nilgiri hills, Tamil Nadu, India.

${site.description}

Business details:
- Phone/WhatsApp: ${site.phone}
- Email: ${site.email}
- Hours: ${site.hours}
- Address: ${site.address}

Signature packages:
${packages || "- (ask the visitor what kind of trip they're planning)"}

Fleet:
${fleet || "- A range of chauffeured vehicles from economy sedans to luxury SUVs"}

Popular destinations covered:
${destinations || "- Ooty, Coonoor, Kotagiri and surrounding Nilgiri hills"}

Frequently asked questions:
${faqs || "- No FAQ data available."}

Guidelines:
- Answer only using the information above. If you don't know something specific (exact availability, real-time pricing changes), say so honestly and point the visitor to the booking page (/booking) or WhatsApp (${site.phone}) instead of guessing.
- Keep replies short and warm — 2 to 4 sentences, chat-widget length, not an essay.
- When a visitor is ready to book, direct them to the "Book Now" button or the /booking page. For urgent or detailed queries, suggest WhatsApp.
- Never invent prices, discounts, or availability that aren't listed above.
- You may use light, tasteful formatting (short lists) but avoid heavy markdown.`;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`chat:${ip}`, 20, 10 * 60_000)) {
    return NextResponse.json(
      { error: "You're sending messages too quickly — please wait a moment." },
      { status: 429 }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The chat concierge isn't configured yet. Please reach us on WhatsApp or phone instead." },
      { status: 503 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": site.url,
      "X-Title": site.name,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || FALLBACK_MODEL,
      stream: true,
      temperature: 0.6,
      messages: [{ role: "system", content: buildSystemPrompt() }, ...parsed.data.messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `The concierge is unavailable right now. ${detail.slice(0, 200)}`.trim() },
      { status: 502 }
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta.length > 0) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // ignore malformed SSE fragments
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
