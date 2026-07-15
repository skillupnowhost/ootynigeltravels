"use client";

import { useState } from "react";
import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mail, Phone, PhoneCall, PhoneIncoming } from "lucide-react";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { AIAgentIcon, HeadsetPulseIcon } from "@/components/ui/AnimatedIcons";
import { WhatsAppGlyphIcon, InstagramIcon, TelegramIcon } from "@/components/ui/BrandIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { submitContactMessage, type ContactFormState } from "@/lib/actions/public";
import { site, waLink } from "@/lib/config/site";

const ease = [0.22, 1, 0.36, 1] as const;
const igHandle = site.social.instagram.split("/").filter(Boolean).pop() ?? "ootynigeltravels";
const callbackInitialState: ContactFormState = { ok: false };

type Action =
  | { key: string; icon: React.ReactNode; title: string; copy: string; href: string; external?: boolean; tone: string }
  | { key: "callback"; icon: React.ReactNode; title: string; copy: string; tone: string; isCallback: true }
  | { key: "ai"; icon: React.ReactNode; title: string; copy: string; tone: string; isAI: true };

export function QuickActions() {
  const actions: Action[] = [
    {
      key: "call",
      icon: (
        <MotionIcon preset="ring" loop>
          <Phone size={22} />
        </MotionIcon>
      ),
      title: "Call Now",
      copy: "Speak to our team directly",
      href: site.phoneHref,
      tone: "forest",
    },
    {
      key: "whatsapp",
      icon: (
        <MotionIcon preset="pulse" loop>
          <WhatsAppGlyphIcon size={22} />
        </MotionIcon>
      ),
      title: "WhatsApp Chat",
      copy: "Usually replies in minutes",
      href: waLink(`Hello ${site.name}, I'd like to know more.`),
      external: true,
      tone: "whatsapp",
    },
    { key: "ai", icon: <AIAgentIcon size={24} />, title: "AI Travel Assistant", copy: "Ask Nigel anything, any time", tone: "gold", isAI: true },
    {
      key: "email",
      icon: (
        <MotionIcon preset="tilt">
          <Mail size={22} />
        </MotionIcon>
      ),
      title: "Email Support",
      copy: "For detailed itinerary requests",
      href: `mailto:${site.email}`,
      tone: "forest",
    },
    {
      key: "booking-support",
      icon: <HeadsetPulseIcon size={22} />,
      title: "Live Booking Support",
      copy: "Dedicated line for active bookings",
      href: site.bookingSupportPhoneHref,
      tone: "gold",
    },
    {
      key: "callback",
      icon: (
        <MotionIcon preset="wiggle">
          <PhoneIncoming size={22} />
        </MotionIcon>
      ),
      title: "Request a Callback",
      copy: "Leave your number, we'll call you",
      tone: "forest",
      isCallback: true,
    },
    {
      key: "telegram",
      icon: (
        <MotionIcon preset="tilt">
          <TelegramIcon size={22} />
        </MotionIcon>
      ),
      title: "Telegram",
      copy: "Chat with us on Telegram",
      href: site.social.telegram,
      external: true,
      tone: "telegram",
    },
    {
      key: "instagram",
      icon: (
        <MotionIcon preset="orbit">
          <InstagramIcon size={22} />
        </MotionIcon>
      ),
      title: "Instagram DM",
      copy: `Message @${igHandle}`,
      href: `https://ig.me/m/${igHandle}`,
      external: true,
      tone: "instagram",
    },
  ];

  return (
    <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
      {actions.map((action) => (
        <RevealItem key={action.key}>
          <QuickActionCard action={action} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

const TONE_STYLES: Record<string, { badge: string; border: string }> = {
  forest: { badge: "bg-forest-900 text-gold-400 group-hover:bg-forest-800", border: "hover:border-gold-300" },
  gold: { badge: "bg-gold-600 text-forest-950", border: "hover:border-gold-400" },
  whatsapp: { badge: "bg-[#25D366] text-white", border: "hover:border-[#25D366]/60" },
  telegram: { badge: "bg-[#229ED9] text-white", border: "hover:border-[#229ED9]/60" },
  instagram: {
    badge: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white",
    border: "hover:border-[#dd2a7b]/60",
  },
};

function QuickActionCard({ action }: { action: Action }) {
  const tone = TONE_STYLES[action.tone] ?? TONE_STYLES.forest;
  const [expanded, setExpanded] = useState(false);

  const body = (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease }}
      className={`group flex h-full flex-col gap-3 rounded-2xl border border-forest-100 bg-white/85 p-5 backdrop-blur-md transition-colors duration-300 ${tone.border} hover:shadow-[0_20px_44px_-24px_rgba(11,59,46,0.35)]`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-300 ${tone.badge}`}>
        {action.icon}
      </span>
      <div>
        <p className="font-display text-base text-forest-950">{action.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-charcoal-500">{action.copy}</p>
      </div>
    </motion.div>
  );

  if ("isAI" in action) {
    return (
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-chat-widget"))}
        className="block h-full w-full text-left"
      >
        {body}
      </button>
    );
  }

  if ("isCallback" in action) {
    return (
      <div className="h-full">
        <button type="button" onClick={() => setExpanded((v) => !v)} className="block w-full text-left" aria-expanded={expanded}>
          {body}
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <CallbackForm onDone={() => setExpanded(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <a href={action.href} target={action.external ? "_blank" : undefined} rel={action.external ? "noopener noreferrer" : undefined} className="block h-full">
      {body}
    </a>
  );
}

function CallbackForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(submitContactMessage, callbackInitialState);

  if (state.ok) {
    return (
      <div className="mt-3 rounded-2xl border border-forest-100 bg-forest-50 p-4 text-center text-sm text-forest-800">
        Thanks — we&rsquo;ll call you back shortly.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={() => setTimeout(onDone, 1200)}
      className="mt-3 space-y-2.5 rounded-2xl border border-forest-100 bg-forest-50/70 p-4"
    >
      <input type="hidden" name="subject" value="Callback request" />
      <input type="hidden" name="message" value="Please call me back at the earliest opportunity." />
      <input
        type="text"
        name="name"
        required
        placeholder="Your name"
        className="w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
      />
      <input
        type="tel"
        name="phone"
        required
        placeholder="Mobile number"
        className="w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-900 px-4 py-2.5 text-xs font-semibold text-ivory-50 transition-colors hover:bg-forest-800 disabled:opacity-60"
      >
        <PhoneCall size={13} />
        {pending ? "Sending..." : "Request callback"}
      </button>
    </form>
  );
}
