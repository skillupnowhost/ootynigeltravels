"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { X, Send, Compass } from "lucide-react";
import { AIAgentIcon } from "@/components/ui/AnimatedIcons";
import { site, waLink } from "@/lib/config/site";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content: `Vanakkam! I'm Nigel, your ${site.name} travel concierge. Ask me about packages, the fleet, destinations around Ooty, or how booking works.`,
};

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Packages", href: "/packages" },
  { label: "Destinations", href: "/destinations" },
  { label: "Fleet", href: "/fleet" },
  { label: "Book Now", href: "/booking" },
  { label: "FAQs", href: "/faq" },
];

const STARTER_SUGGESTIONS = [
  "Show me your signature packages",
  "What's the best time to visit Ooty?",
  "What vehicles are in your fleet?",
  "How does booking work?",
];

const FOLLOWUP_POOL = [
  "Any family-friendly packages?",
  "Do you cover Coonoor and Kotagiri too?",
  "What's included in the package price?",
  "Can I customize my itinerary?",
  "Do you offer airport pickup?",
  "How do I pay for my booking?",
  "What if I need to reschedule?",
  "Can I speak to a human?",
];

function pickSuggestions(pool: string[], count: number): string[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Renders **bold** text and [label](/path) or [label](https://...) links from otherwise plain text. */
function renderMessageContent(content: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = linkRegex.exec(content))) {
    if (match.index > lastIndex) {
      nodes.push(...renderInline(content.slice(lastIndex, match.index), `${keyPrefix}-t${i}`));
    }
    const [, label, href] = match;
    const linkClass = "font-semibold text-forest-900 underline decoration-gold-500 decoration-2 underline-offset-2 hover:text-forest-700";
    nodes.push(
      href.startsWith("http") ? (
        <a key={`${keyPrefix}-l${i}`} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label}
        </a>
      ) : (
        <Link key={`${keyPrefix}-l${i}`} href={href} className={linkClass}>
          {label}
        </Link>
      )
    );
    lastIndex = match.index + match[0].length;
    i++;
  }
  if (lastIndex < content.length) {
    nodes.push(...renderInline(content.slice(lastIndex), `${keyPrefix}-t${i}`));
  }
  return nodes;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-b${idx}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-s${idx}`}>{part}</span>
    )
  );
}

function BotAvatar({ size = 32 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-forest-900 text-gold-400"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <AIAgentIcon size={size * 0.62} />
    </span>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-forest-500"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(STARTER_SUGGESTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    const onOpenRequest = () => setOpen(true);
    window.addEventListener("open-chat-widget", onOpenRequest);
    return () => window.removeEventListener("open-chat-widget", onOpenRequest);
  }, []);

  // Closing on an outside click leaves `messages`/`suggestions` state untouched,
  // so reopening (toggle button or the "open-chat-widget" event) resumes the
  // same conversation right where it left off.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function requestReply(history: ChatMessage[]) {
    setError(null);
    setLastFailedMessage(null);
    setPending(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let streamedAny = false;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "The concierge is unavailable right now.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        streamedAny = true;
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      }

      if (!streamedAny) {
        throw new Error("The concierge didn't respond. Please try again.");
      }

      setSuggestions(pickSuggestions(FOLLOWUP_POOL, 4));
    } catch (err) {
      // Drop the empty assistant placeholder bubble left behind by a failed/aborted stream.
      setMessages((prev) => (prev[prev.length - 1]?.role === "assistant" && prev[prev.length - 1]?.content === "" ? prev.slice(0, -1) : prev));
      const lastUser = [...history].reverse().find((m) => m.role === "user");
      setLastFailedMessage(lastUser?.content ?? null);
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? "That took too long to respond. Please try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong."
      );
    } finally {
      clearTimeout(timeout);
      setPending(false);
    }
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    void requestReply(nextMessages);
  }

  function retryLastMessage() {
    if (pending) return;
    void requestReply(messages);
  }

  return (
    <div ref={containerRef} className="contents">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        aria-label={open ? "Close travel concierge chat" : "Open travel concierge chat"}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 16 }}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-forest-900 text-gold-400 shadow-[0_10px_30px_-6px_rgba(11,59,46,0.6)]"
      >
        <AnimatePresence>
          {hovered && !open && (
            <motion.span
              initial={{ opacity: 0, x: 8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.9 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-forest-950 px-4 py-2 text-xs font-semibold text-gold-300 shadow-[0_10px_24px_-8px_rgba(11,59,46,0.5)] sm:block"
            >
              Ask Nigel, our AI concierge
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AIAgentIcon size={28} />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-ivory-50 bg-[#25D366]" aria-hidden />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card fixed bottom-[9.5rem] right-3 left-3 z-40 mx-auto flex h-[min(70dvh,560px,calc(100dvh_-_11rem))] w-auto max-w-[380px] flex-col overflow-hidden rounded-3xl border border-forest-100 shadow-[0_30px_70px_-30px_rgba(11,59,46,0.45)] sm:left-auto sm:right-4 sm:mx-0 sm:w-[380px]"
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-forest-100 bg-forest-950 px-5 py-4 text-ivory-50">
              <BotAvatar />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base leading-tight">Nigel · Travel Concierge</p>
                <p className="text-xs text-forest-300">{pending ? "Nigel is typing…" : "Usually replies in seconds"}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-forest-300 transition-colors hover:bg-forest-900 hover:text-ivory-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-forest-100 bg-forest-50/60 px-3 py-2">
              <Compass size={14} className="shrink-0 text-forest-500" aria-hidden />
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="shrink-0 whitespace-nowrap rounded-full border border-forest-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-forest-800 transition-colors hover:border-gold-400 hover:text-gold-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {m.role === "assistant" && <BotAvatar size={26} />}
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-gold-600 text-forest-950"
                        : "rounded-bl-sm bg-forest-50 text-charcoal-900"
                    }`}
                  >
                    {m.content
                      ? renderMessageContent(m.content, `m${i}`)
                      : pending && i === messages.length - 1
                        ? <TypingDots />
                        : null}
                  </div>
                </div>
              ))}
              {error && (
                <div className="rounded-xl border border-gold-400 bg-gold-50 px-3 py-2 text-xs text-gold-900">
                  <p>{error}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {lastFailedMessage && (
                      <button
                        type="button"
                        onClick={retryLastMessage}
                        className="font-semibold underline underline-offset-2 hover:text-forest-900"
                      >
                        Try again
                      </button>
                    )}
                    <span>
                      or reach us on{" "}
                      <a href={waLink("Hello, I have a question.")} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                        WhatsApp
                      </a>
                      .
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!pending && !error && suggestions.length > 0 && (
              <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-forest-100 bg-white px-3 pt-2.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-forest-200 bg-forest-50 px-3.5 py-1.5 text-xs font-medium text-forest-800 transition-colors hover:border-gold-400 hover:bg-gold-50 hover:text-gold-800"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex shrink-0 items-center gap-2 border-t border-forest-100 bg-white px-3 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about packages, fleet, routes…"
                className="min-w-0 flex-1 rounded-full border border-forest-200 bg-ivory-50 px-4 py-2.5 text-sm outline-none focus:border-gold-600"
                disabled={pending}
              />
              <motion.button
                type="submit"
                disabled={pending || !input.trim()}
                whileHover={{ scale: 1.08, rotate: -6 }}
                whileTap={{ scale: 0.92 }}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-900 text-gold-400 disabled:opacity-40"
              >
                <Send size={17} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
