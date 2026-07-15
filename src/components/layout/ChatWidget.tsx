"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Send } from "lucide-react";
import { AIAgentIcon } from "@/components/ui/AnimatedIcons";
import { site, waLink } from "@/lib/config/site";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content: `Vanakkam! I'm Nigel, your ${site.name} travel concierge. Ask me about packages, the fleet, destinations around Ooty, or how booking works.`,
};

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    const onOpenRequest = () => setOpen(true);
    window.addEventListener("open-chat-widget", onOpenRequest);
    return () => window.removeEventListener("open-chat-widget", onOpenRequest);
  }, []);

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
    <>
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
              className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-forest-950 px-4 py-2 text-xs font-semibold text-gold-300 shadow-[0_10px_24px_-8px_rgba(11,59,46,0.5)]"
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
            className="glass-card fixed bottom-[9.5rem] right-4 z-40 flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-forest-100 shadow-[0_30px_70px_-30px_rgba(11,59,46,0.45)]"
          >
            <div className="flex items-center gap-3 border-b border-forest-100 bg-forest-950 px-5 py-4 text-ivory-50">
              <BotAvatar />
              <div className="min-w-0">
                <p className="font-display text-base leading-tight">Nigel · Travel Concierge</p>
                <p className="text-xs text-forest-300">Usually replies in seconds</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {m.role === "assistant" && <BotAvatar size={26} />}
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-gold-600 text-forest-950"
                        : "rounded-bl-sm bg-forest-50 text-charcoal-900"
                    }`}
                  >
                    {m.content || (pending && i === messages.length - 1 ? <TypingDots /> : null)}
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-forest-100 bg-white px-3 py-3"
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
    </>
  );
}
