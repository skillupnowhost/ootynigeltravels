import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireStaff } from "@/lib/auth/rbac";
import { adminLogoutAction } from "@/lib/actions/adminAuth";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { filterNavSectionsByRole } from "@/lib/adminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const navSections = filterNavSectionsByRole(user.role);

  return (
    <div className="flex min-h-screen bg-ivory-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-forest-950 text-ivory-50 lg:flex">
        <div className="border-b border-forest-800 px-6 py-6">
          <p className="font-display text-lg">
            Ooty <span className="text-gold-400">Nigel</span>
          </p>
          <p className="text-xs text-forest-400">Admin Console</p>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-forest-500">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-forest-200 transition-colors duration-200 hover:bg-forest-900 hover:text-ivory-50"
                  >
                    <MotionIcon preset="pop" className="text-forest-400 group-hover:text-gold-400">
                      <item.icon size={17} />
                    </MotionIcon>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-forest-800 p-4">
          <p className="px-2 text-xs text-forest-400">
            {user.name} · <span className="capitalize">{user.role}</span>
          </p>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="group mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-forest-300 transition-colors duration-200 hover:bg-forest-900 hover:text-ivory-50"
            >
              <MotionIcon preset="wiggle" className="text-forest-400 group-hover:text-gold-400">
                <LogOut size={16} />
              </MotionIcon>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="relative flex items-center justify-between border-b border-forest-100 bg-white px-4 py-4 sm:px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <AdminMobileNav role={user.role} />
            <p className="font-display text-lg text-forest-950">Admin Console</p>
          </div>
          <form action={adminLogoutAction}>
            <button type="submit" className="flex items-center gap-1.5 text-sm font-medium text-forest-700">
              <MotionIcon preset="wiggle">
                <LogOut size={15} />
              </MotionIcon>
              Sign out
            </button>
          </form>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
