"use client";

import { motion } from "motion/react";

export function MaintenanceProgressBar({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-1.5 overflow-hidden rounded-full bg-forest-100 ${className}`}>
      <motion.div
        className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-gold-400 via-gold-600 to-gold-400"
        initial={{ x: "-120%" }}
        animate={{ x: "320%" }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
