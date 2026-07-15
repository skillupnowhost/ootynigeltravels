"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, User as UserIcon, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/account";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/destinations", label: "Destinations" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Travel Guide" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type SessionUser = { name: string; role: string } | null;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/session")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Close the mobile menu on navigation — adjusted during render (per React's
  // "you might not need an effect" guidance) rather than in a useEffect.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  return (
    <header
      className={`glass-card fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
        scrolled || open
          ? "border-forest-100 shadow-[0_4px_24px_-8px_rgba(11,59,46,0.12)]"
          : "border-transparent"
      }`}
    >
      <div
        className={`container-luxe flex items-center justify-between transition-all duration-500 ${
          scrolled ? "h-16 lg:h-20" : "h-20 lg:h-24"
        }`}
      >
        <Link href="/" className="flex items-center pl-1 sm:pl-2">
          <Image
            src="/images/brand/logo-full.png"
            alt="Ooty Nigel Travels — Luxury Journeys, Timeless Memories"
            width={1024}
            height={1024}
            preload
            className={`w-auto transition-all duration-500 ${
              scrolled ? "h-11 sm:h-12 lg:h-16" : "h-14 sm:h-16 lg:h-20"
            }`}
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-10" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-base font-medium tracking-wide transition-colors hover:text-gold-700 ${
                pathname === link.href ? "text-gold-700" : "text-forest-900"
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.span
                  layoutId="nav-active-dot"
                  className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold-600"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/booking"
            className="rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-ivory-50 transition-all hover:bg-gold-600 hover:text-forest-950"
          >
            Book Now
          </Link>
          <AuthControl user={user} />
        </div>

        <button
          className="lg:hidden rounded-full p-2 text-forest-900"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="inline-flex">
                <X size={26} />
              </motion.span>
            ) : (
              <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="inline-flex">
                <Menu size={26} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden glass-card border-t border-forest-100"
          >
            <nav className="container-luxe flex flex-col gap-1 py-4" aria-label="Mobile">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-base font-medium text-forest-900 hover:bg-forest-100"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/booking"
                className="mt-2 rounded-full bg-gold-600 px-5 py-3 text-center text-sm font-semibold text-forest-950"
              >
                Book Now
              </Link>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="mt-2 flex items-center gap-3 rounded-full border border-forest-200 px-4 py-2.5 text-sm font-medium text-forest-900"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-900 text-xs font-semibold text-gold-400">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                    {user.name.split(" ")[0]}&rsquo;s Account
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-forest-100 px-5 py-3 text-sm font-medium text-charcoal-500"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <div className="mt-2 flex items-center gap-3">
                  <Link
                    href="/account/login"
                    className="flex flex-1 items-center justify-center rounded-full border border-forest-200 px-5 py-3 text-center text-sm font-semibold text-forest-900"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/account/register"
                    className="flex flex-1 items-center justify-center rounded-full bg-gold-600 px-5 py-3 text-center text-sm font-semibold text-forest-950"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function AuthControl({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (user) {
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`${user.name}'s account menu`}
          className="flex items-center gap-2 rounded-full border border-forest-200 py-1.5 pl-1.5 pr-3 transition-all hover:border-gold-400"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-900 text-sm font-semibold text-gold-400">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-[7rem] truncate text-sm font-medium text-forest-900">{user.name.split(" ")[0]}</span>
          <ChevronDown size={14} className={`text-forest-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-forest-100 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(11,59,46,0.35)]"
            >
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-forest-900 hover:bg-forest-50"
              >
                <LayoutDashboard size={16} className="text-forest-600" />
                My Account
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-charcoal-500 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account/login"
        className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 px-5 py-3 text-sm font-medium text-forest-900 transition-all hover:border-gold-500 hover:text-gold-700"
      >
        <UserIcon size={15} />
        Log in
      </Link>
      <Link
        href="/account/register"
        className="inline-flex items-center gap-1.5 rounded-full bg-gold-600 px-5 py-3 text-sm font-semibold text-forest-950 transition-all hover:bg-gold-500"
      >
        Sign up
      </Link>
    </div>
  );
}
