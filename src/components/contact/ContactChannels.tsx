"use client";

import { useState, type ReactNode } from "react";
import { useActionState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, Mail, Phone, PhoneIncoming, ArrowUpRight } from "lucide-react";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { AIAgentIcon, HeadsetPulseIcon, MapPinDropIcon, ClockHandsIcon, ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";
import { WhatsAppGlyphIcon } from "@/components/ui/BrandIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { submitContactMessage, type ContactFormState } from "@/lib/actions/public";
import { site, waLink } from "@/lib/config/site";

const ease = [0.22, 1, 0.36, 1] as const;
const callbackInitialState: ContactFormState = { ok: false };

function copyToClipboard(value: string, setCopied: (v: boolean) => void) {
  navigator.clipboard.writeText(value);
  setCopied(true);
  setTimeout(() => setCopied(false), 1500);
}

export function ContactChannels() {
  return (
    <div className="space-y-6">
      <RevealGroup className="grid gap-4 lg:grid-cols-4 lg:grid-rows-2" stagger={0.07}>
        <RevealItem className="lg:col-span-2 lg:row-span-2">
          <ConciergeFeatureTile />
        </RevealItem>
        <RevealItem>
          <ChannelTile
            title="Call Now"
            value={site.phone}
            icon={
              <MotionIcon preset="ring" loop>
                <Phone size={20} />
              </MotionIcon>
            }
            href={site.phoneHref}
            copyValue={site.phone}
          />
        </RevealItem>
        <RevealItem>
          <ChannelTile
            title="WhatsApp Chat"
            value="Usually replies in minutes"
            icon={
              <MotionIcon preset="pulse" loop>
                <WhatsAppGlyphIcon size={20} />
              </MotionIcon>
            }
            href={waLink(`Hello ${site.name}, I'd like to know more.`)}
            external
            tone="whatsapp"
          />
        </RevealItem>
        <RevealItem>
          <ChannelTile
            title="Email Support"
            value={site.email}
            icon={
              <MotionIcon preset="tilt">
                <Mail size={20} />
              </MotionIcon>
            }
            href={`mailto:${site.email}`}
            copyValue={site.email}
          />
        </RevealItem>
        <RevealItem>
          <ChannelTile
            title="Office Address"
            value={site.address}
            icon={<MapPinDropIcon size={20} />}
            copyValue={site.address}
          />
        </RevealItem>
      </RevealGroup>

      <RevealItem>
        <AtAGlanceStrip />
      </RevealItem>

      <RevealItem>
        <CallbackBanner />
      </RevealItem>
    </div>
  );
}

function ConciergeFeatureTile() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease }}
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] border border-forest-800 bg-forest-950 p-6 text-ivory-50 sm:p-7"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(220,192,139,0.35), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-600 text-forest-950">
            <AIAgentIcon size={24} />
          </span>
          <div>
            <p className="font-display text-lg text-ivory-50">Nigel · AI Concierge</p>
            <span className="inline-flex items-center gap-1.5 text-xs text-forest-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
              Online now
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-6 space-y-2.5">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-4 py-2.5 text-xs leading-relaxed text-forest-100 backdrop-blur-sm">
          Ask me about packages, the fleet, or the best time to visit Ooty.
        </div>
        <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-gold-600/90 px-4 py-2.5 text-xs leading-relaxed text-forest-950">
          What&rsquo;s a good 3-day family itinerary?
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-chat-widget"))}
        className="group relative mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-ivory-50 px-5 py-3 text-sm font-semibold text-forest-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400"
      >
        Start chatting
        <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    </motion.div>
  );
}

function ChannelTile({
  title,
  value,
  icon,
  href,
  external,
  copyValue,
  tone = "forest",
}: {
  title: string;
  value: string;
  icon: ReactNode;
  href?: string;
  external?: boolean;
  copyValue?: string;
  tone?: "forest" | "whatsapp";
}) {
  const [copied, setCopied] = useState(false);
  const badgeClass = tone === "whatsapp" ? "bg-[#25D366] text-white" : "bg-forest-900 text-gold-400 group-hover:bg-forest-800";
  const borderClass = tone === "whatsapp" ? "hover:border-[#25D366]/60" : "hover:border-gold-300";

  const card = (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease }}
      className={`group relative flex h-full flex-col justify-between gap-4 rounded-2xl border border-forest-100 bg-white/85 p-5 backdrop-blur-md transition-colors duration-300 ${borderClass} hover:shadow-[0_20px_44px_-24px_rgba(11,59,46,0.35)]`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 ${badgeClass}`}>
          {icon}
        </span>
        {copyValue && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              copyToClipboard(copyValue, setCopied);
            }}
            aria-label={`Copy ${title}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-charcoal-500 opacity-0 transition-all duration-200 hover:bg-forest-50 hover:text-forest-900 group-hover:opacity-100"
          >
            {copied ? <Check size={14} className="text-forest-600" /> : <Copy size={14} />}
          </button>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-display text-base text-forest-950">{title}</p>
        <p className="mt-1 truncate text-xs leading-relaxed text-charcoal-500">{value}</p>
      </div>
    </motion.div>
  );

  if (!href) return card;
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block h-full">
      {card}
    </a>
  );
}

const GLANCE_ITEMS = [
  { key: "hours", icon: <ClockHandsIcon size={17} />, label: "Business Hours", value: site.hours },
  { key: "emergency", icon: <ShieldBadgeIcon size={17} />, label: "Emergency Contact", value: site.emergencyPhone, href: site.emergencyPhoneHref, copyValue: site.emergencyPhone },
  { key: "booking-support", icon: <HeadsetPulseIcon size={17} />, label: "Booking Support", value: site.bookingSupportPhone, href: site.bookingSupportPhoneHref, copyValue: site.bookingSupportPhone },
];

function AtAGlanceStrip() {
  return (
    <div className="grid divide-y divide-forest-100 overflow-hidden rounded-2xl border border-forest-100 bg-white/70 backdrop-blur-md sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {GLANCE_ITEMS.map((item) => (
        <GlanceItem key={item.key} item={item} />
      ))}
    </div>
  );
}

function GlanceItem({
  item,
}: {
  item: { key: string; icon: ReactNode; label: string; value: string; href?: string; copyValue?: string };
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative flex items-center gap-3 px-5 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-800">
        {item.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">{item.label}</p>
        {item.href ? (
          <a href={item.href} className="truncate text-sm font-medium text-forest-950 hover:text-gold-700">
            {item.value}
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-forest-950">{item.value}</p>
        )}
      </div>
      {item.copyValue && (
        <button
          type="button"
          onClick={() => copyToClipboard(item.copyValue!, setCopied)}
          aria-label={`Copy ${item.label}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-charcoal-500 opacity-0 transition-all duration-200 hover:bg-forest-50 hover:text-forest-900 group-hover:opacity-100"
        >
          {copied ? <Check size={13} className="text-forest-600" /> : <Copy size={13} />}
        </button>
      )}
    </div>
  );
}

function CallbackBanner() {
  const [expanded, setExpanded] = useState(false);
  const [state, formAction, pending] = useActionState(submitContactMessage, callbackInitialState);

  return (
    <div className="rounded-2xl border border-dashed border-gold-300 bg-gold-50/40 p-5 sm:p-6">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-900 text-gold-400">
            <MotionIcon preset="wiggle">
              <PhoneIncoming size={20} />
            </MotionIcon>
          </span>
          <div>
            <p className="font-display text-base text-forest-950">Prefer we call you?</p>
            <p className="mt-0.5 text-xs text-charcoal-500">Leave your number — we&rsquo;ll ring back shortly.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-gold-300 bg-white px-4 py-2 text-xs font-semibold text-forest-800">
          {expanded ? "Close" : "Request callback"}
        </span>
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
            {state.ok ? (
              <div className="mt-4 rounded-xl border border-forest-100 bg-white p-4 text-center text-sm text-forest-800">
                Thanks — we&rsquo;ll call you back shortly.
              </div>
            ) : (
              <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
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
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-2.5 text-xs font-semibold text-ivory-50 transition-colors hover:bg-forest-800 disabled:opacity-60"
                >
                  {pending ? "Sending..." : "Call me back"}
                </button>
                {state.error && <p className="text-xs text-red-600 sm:col-span-3">{state.error}</p>}
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
