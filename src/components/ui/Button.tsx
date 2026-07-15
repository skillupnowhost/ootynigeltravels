import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

type Variant = "gold" | "forest" | "ghost" | "outline";

const base =
  "group relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-5 py-3 text-[13px] font-semibold tracking-wide transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none sm:gap-2 sm:px-7 sm:py-3.5 sm:text-sm";

const variants: Record<Variant, string> = {
  gold:
    "bg-gold-600 text-forest-950 hover:bg-gold-700 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-8px_rgba(200,161,92,0.6)] active:translate-y-0",
  forest:
    "bg-forest-900 text-ivory-50 hover:bg-forest-800 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-8px_rgba(11,59,46,0.55)] active:translate-y-0",
  ghost: "text-forest-900 hover:bg-forest-100",
  outline:
    "border border-forest-300 text-forest-900 hover:border-gold-600 hover:bg-gold-50",
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: boolean;
}

export function Button({
  children,
  variant = "gold",
  className = "",
  icon = true,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      {icon && (
        <ArrowUpRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </button>
  );
}

const iconBase =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

export function IconButton({
  children,
  active = false,
  className = "",
  ...rest
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${iconBase} ${
        active
          ? "border-gold-500 bg-gold-50 text-gold-700 shadow-[0_10px_24px_-12px_rgba(200,161,92,0.6)]"
          : "border-forest-200 bg-white text-forest-700 hover:border-gold-400 hover:text-gold-700"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  variant = "gold",
  className = "",
  icon = true,
  href,
  ...rest
}: CommonProps & { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
  const anchorProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...anchorProps} {...rest}>
      {children}
      {icon && (
        <ArrowUpRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </Link>
  );
}
