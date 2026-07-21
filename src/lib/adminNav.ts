import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Car,
  Package,
  UserCog,
  Ticket,
  Star,
  Mail,
  BarChart3,
  ScrollText,
  ShieldCheck,
  MapPinned,
  Compass,
  Sparkles,
  Image as ImageIcon,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export type AdminRole = "admin" | "manager" | "staff";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: readonly AdminRole[];
};

export type AdminNavSection = {
  label: string;
  items: readonly AdminNavItem[];
};

export const ADMIN_NAV_SECTIONS: readonly AdminNavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "staff"] }],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, roles: ["admin", "manager", "staff"] },
      { href: "/admin/trip-requests", label: "Trip Requests", icon: MapPinned, roles: ["admin", "manager", "staff"] },
      { href: "/admin/customers", label: "Customers", icon: Users, roles: ["admin", "manager"] },
      { href: "/admin/fleet", label: "Fleet", icon: Car, roles: ["admin", "manager"] },
      { href: "/admin/drivers", label: "Drivers", icon: UserCog, roles: ["admin", "manager"] },
      { href: "/admin/pickup-locations", label: "Pickup Locations", icon: MapPin, roles: ["admin", "manager"] },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/packages", label: "Packages", icon: Package, roles: ["admin", "manager"] },
      { href: "/admin/destinations", label: "Destinations", icon: Compass, roles: ["admin", "manager"] },
      { href: "/admin/hidden-gems", label: "Hidden Gems", icon: Sparkles, roles: ["admin", "manager"] },
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, roles: ["admin", "manager"] },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket, roles: ["admin", "manager"] },
      { href: "/admin/reviews", label: "Reviews", icon: Star, roles: ["admin", "manager"] },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Mail, roles: ["admin", "manager"] },
      { href: "/admin/reports", label: "Reports", icon: BarChart3, roles: ["admin", "manager"] },
      { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText, roles: ["admin"] },
      { href: "/admin/users", label: "Staff Users", icon: ShieldCheck, roles: ["admin"] },
    ],
  },
] as const;

export function filterNavSectionsByRole(role: string): AdminNavSection[] {
  return ADMIN_NAV_SECTIONS.map((section) => ({
    label: section.label,
    items: section.items.filter((item) => (item.roles as readonly string[]).includes(role)),
  })).filter((section) => section.items.length > 0);
}
