"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { filterNavSectionsByRole } from "@/lib/adminNav";

export function AdminMobileNav({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState<string | null>(null);
  const pathname = usePathname();

  // Close the mobile menu on navigation — adjusted during render (per React's
  // "you might not need an effect" guidance) rather than in a useEffect.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  const sections = filterNavSectionsByRole(role);

  return (
    <div className="lg:hidden">
      <button
        className="flex items-center gap-1.5 rounded-lg p-1.5 text-forest-900"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-forest-100 bg-white shadow-lg"
            aria-label="Admin"
          >
            <div className="flex flex-col gap-4 p-3">
              {sections.map((section) => (
                <div key={section.label}>
                  <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-forest-400">
                    {section.label}
                  </p>
                  <div className="flex flex-col gap-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                          pathname === item.href
                            ? "bg-forest-100 text-forest-950"
                            : "text-forest-700 hover:bg-forest-50"
                        }`}
                      >
                        <item.icon size={17} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
