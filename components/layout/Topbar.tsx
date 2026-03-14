"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/hooks";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bell, Settings, LogOut, User, ChevronRight, Menu, Sparkles } from "lucide-react";
import { NavLinks } from "@/components/layout/Sidebar";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/assets": "Assets",
  "/dashboard/categories": "Categories",
  "/dashboard/quotes": "Quotes",
  "/dashboard/quotes/new": "New Quote",
  "/dashboard/clients": "Clients",
  "/dashboard/events": "Events",
  "/dashboard/users": "Team",
  "/dashboard/profile": "Profile",
};

function getBreadcrumb(pathname: string): { parent: string; current: string } {
  if (pathname.match(/\/dashboard\/assets\/.+/))
    return { parent: "Assets", current: "Asset Detail" };
  if (
    pathname.match(/\/dashboard\/quotes\/.+/) &&
    !pathname.endsWith("/new")
  )
    return { parent: "Quotes", current: "Quote Detail" };
  if (pathname.match(/\/dashboard\/clients\/.+/))
    return { parent: "Clients", current: "Client Detail" };
  if (pathname.match(/\/dashboard\/events\/.+/))
    return { parent: "Events", current: "Event Detail" };
  const label = routeLabels[pathname] ?? "Dashboard";
  return { parent: "Dashboard", current: label };
}

export default function Topbar() {
  const session = useAppSelector((s) => s.session);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const { parent, current } = getBreadcrumb(pathname);
  const showParent = current !== "Dashboard";

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
    <>
      <header
        className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 lg:left-64 lg:px-8"
        aria-label="Top navigation"
      >
        {/* Left: hamburger (mobile) + breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Breadcrumb */}
          <div
            className="flex items-center gap-1.5 text-sm"
            aria-label="Breadcrumb"
          >
            {showParent && (
              <>
                <span className="text-slate-400 hidden sm:inline">{parent}</span>
                <ChevronRight
                  className="h-3.5 w-3.5 text-slate-300 hidden sm:inline"
                  aria-hidden="true"
                />
              </>
            )}
            <span className="font-semibold text-slate-900">{current}</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-brand transition-colors"
          >
            <Bell className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
          <button
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-brand transition-colors"
          >
            <Settings className="h-4.5 w-4.5" aria-hidden="true" />
          </button>

          <div className="mx-2 h-5 w-px bg-slate-200" aria-hidden="true" />

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="User menu"
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors"
            >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 border border-brand/20 text-xs font-semibold text-brand shrink-0"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 leading-none max-w-30 truncate">
                    {session.name ?? "…"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {session.role ?? ""}
                  </p>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 bg-white border-slate-200 shadow-lg shadow-slate-200/50"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-slate-400 font-normal">
                  {session.email}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                  className="gap-2 cursor-pointer text-slate-600 focus:text-slate-900 focus:bg-slate-50"
                >
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="gap-2 text-red-500 cursor-pointer focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile nav sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-72 p-0 bg-linear-to-b from-brand to-brand-dark border-none shadow-2xl shadow-brand-dark/40">
          <SheetHeader className="flex flex-row items-center gap-3 h-16 px-6 border-b border-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <SheetTitle className="text-base font-semibold text-white tracking-tight">
              RubiEvents
            </SheetTitle>
          </SheetHeader>

          <nav
            className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5"
            aria-label="Mobile navigation"
          >
            <NavLinks role={session.role} onNavigate={() => setMobileOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
