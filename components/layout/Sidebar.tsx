"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  CalendarDays,
  Tag,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Assets", href: "/dashboard/assets", icon: Package },
  { label: "Categories", href: "/dashboard/categories", icon: Tag },
  { label: "Quotes", href: "/dashboard/quotes", icon: FileText },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Events", href: "/dashboard/events", icon: CalendarDays },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-white/15 text-white"
                : "text-white/55 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                active ? "text-white" : "text-white/40"
              )}
              aria-hidden="true"
            />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar() {
  const session = useAppSelector((s) => s.session);
  const router = useRouter();

  const initials = session.name
    ? session.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-brand shadow-2xl "
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white">
          RubiEvents
        </span>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5"
        aria-label="Sidebar navigation"
      >
        <NavLinks />
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session.name ?? "…"}
            </p>
            <p className="text-xs text-white/50 truncate">
              {session.role ?? ""}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
