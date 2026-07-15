"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WhatsAppGlyphIcon } from "@/components/ui/BrandIcons";
import { site, waLink } from "@/lib/config/site";

export function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={waLink(`Hello ${site.name}, I'd like to know more about your Ooty travel packages.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 16 }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)]"
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: 8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-forest-950 px-4 py-2 text-xs font-semibold text-ivory-50 shadow-[0_10px_24px_-8px_rgba(11,59,46,0.5)]"
          >
            Chat on WhatsApp
          </motion.span>
        )}
      </AnimatePresence>

      <motion.span
        animate={{ rotate: hovered ? [0, -10, 10, -6, 0] : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <WhatsAppGlyphIcon size={28} className="text-white" />
      </motion.span>
    </motion.a>
  );
}
