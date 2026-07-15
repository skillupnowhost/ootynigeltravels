"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Copy, Check, Mail, Phone, PhoneCall } from "lucide-react";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { HeadsetPulseIcon, MapPinDropIcon, ClockHandsIcon, ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { site, waLink } from "@/lib/config/site";

interface InfoCard {
  key: string;
  icon: ReactNode;
  label: string;
  value: string;
  copyValue?: string;
  href?: string;
  external?: boolean;
  tone?: "gold" | "green";
}

export function ContactInfoCards() {
  const cards: InfoCard[] = [
    {
      key: "address",
      icon: <MapPinDropIcon size={20} />,
      label: "Office Address",
      value: site.address,
      copyValue: site.address,
    },
    {
      key: "mobile",
      icon: (
        <MotionIcon preset="ring" loop>
          <Phone size={18} />
        </MotionIcon>
      ),
      label: "Mobile Number",
      value: site.phone,
      copyValue: site.phone,
      href: site.phoneHref,
    },
    {
      key: "alt-mobile",
      icon: (
        <MotionIcon preset="ring">
          <PhoneCall size={18} />
        </MotionIcon>
      ),
      label: "Alternate Mobile",
      value: site.altPhone,
      copyValue: site.altPhone,
      href: site.altPhoneHref,
    },
    {
      key: "whatsapp",
      icon: <HeadsetPulseIcon size={20} />,
      label: "WhatsApp",
      value: site.phone,
      copyValue: site.phone,
      href: waLink(`Hello ${site.name}, I have a question.`),
      external: true,
      tone: "green",
    },
    {
      key: "email",
      icon: (
        <MotionIcon preset="tilt">
          <Mail size={18} />
        </MotionIcon>
      ),
      label: "Email",
      value: site.email,
      copyValue: site.email,
      href: `mailto:${site.email}`,
    },
    {
      key: "hours",
      icon: <ClockHandsIcon size={20} />,
      label: "Business Hours",
      value: site.hours,
    },
    {
      key: "emergency",
      icon: <ShieldBadgeIcon size={20} />,
      label: "Emergency Contact",
      value: site.emergencyPhone,
      copyValue: site.emergencyPhone,
      href: site.emergencyPhoneHref,
    },
    {
      key: "booking-support",
      icon: (
        <MotionIcon preset="pop">
          <Phone size={18} />
        </MotionIcon>
      ),
      label: "Booking Support",
      value: site.bookingSupportPhone,
      copyValue: site.bookingSupportPhone,
      href: site.bookingSupportPhoneHref,
    },
  ];

  return (
    <RevealGroup className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={0.06}>
      {cards.map((card) => (
        <RevealItem key={card.key}>
          <ContactInfoCardTile card={card} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

function ContactInfoCardTile({ card }: { card: InfoCard }) {
  const [copied, setCopied] = useState(false);
  const isGreen = card.tone === "green";

  function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!card.copyValue) return;
    navigator.clipboard.writeText(card.copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const inner = (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-colors duration-300 ${
        isGreen
          ? "border-[#25D366]/30 bg-[#25D366]/[0.06] hover:border-[#25D366]/60"
          : "border-forest-100 bg-white/80 hover:border-gold-300"
      } hover:shadow-[0_20px_44px_-24px_rgba(11,59,46,0.35)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            isGreen ? "bg-[#25D366] text-white" : "bg-forest-900 text-gold-400 group-hover:bg-forest-800"
          }`}
        >
          {card.icon}
        </span>
        {card.copyValue && (
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${card.label}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-charcoal-500 opacity-0 transition-all duration-200 hover:bg-forest-50 hover:text-forest-900 group-hover:opacity-100"
          >
            {copied ? <Check size={14} className="text-forest-600" /> : <Copy size={14} />}
          </button>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500">{card.label}</p>
        <p className="mt-1 break-words font-display text-base leading-snug text-forest-950">{card.value}</p>
      </div>
      {copied && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-4 top-4 rounded-full bg-forest-900 px-2.5 py-1 text-[10px] font-semibold text-ivory-50"
        >
          Copied
        </motion.span>
      )}
    </motion.div>
  );

  if (!card.href) return inner;
  return (
    <a href={card.href} target={card.external ? "_blank" : undefined} rel={card.external ? "noopener noreferrer" : undefined} className="block h-full">
      {inner}
    </a>
  );
}
