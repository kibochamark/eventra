import { Suspense } from "react";
import { serverFetch } from "@/lib/api";
import { Package, FileText, Users, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import QuoteStatusBadge from "@/components/quotes/QuoteStatusBadge";
import type { Asset, QuoteListItem, Client, EventDetail } from "@/types";

async function getDashboardStats() {
  const [assetsRes, quotesRes, clientsRes] = await Promise.all([
    serverFetch("/assets", { next: { tags: ["assets"], revalidate: 60 } }),
    serverFetch("/quotes", { next: { tags: ["quotes"], revalidate: 60 } }),
    serverFetch("/clients", { next: { tags: ["clients"], revalidate: 60 } }),
  ]);
  const assets: Asset[] = assetsRes.ok ? await assetsRes.json() : [];
  const quotes: QuoteListItem[] = quotesRes.ok ? await quotesRes.json() : [];
  const clients: Client[] = clientsRes.ok ? await clientsRes.json() : [];
  let upcomingEvents = 0;
  const eventsRes = await serverFetch("/events", { next: { revalidate: 60 } });
  if (eventsRes.ok) {
    const events: EventDetail[] = await eventsRes.json();
    upcomingEvents = events.filter((e) => e.status === "UPCOMING").length;
  } else {
    upcomingEvents = quotes.filter((q) => q.status === "APPROVED").length;
  }
  return {
    totalAssets: assets.length,
    pendingQuotes: quotes.filter((q) => q.status === "PENDING_APPROVAL").length,
    activeQuotes: quotes.filter((q) => q.status === "DRAFT" || q.status === "APPROVED").length,
    totalClients: clients.length,
    upcomingEvents,
    recentQuotes: quotes.slice(0, 5),
  };
}

const cardConfig = [
  { key: "totalAssets" as const, label: "Total Assets", icon: Package, href: "/dashboard/assets", accent: "#6366f1" },
  { key: "pendingQuotes" as const, label: "Pending Approval", icon: Clock, href: "/dashboard/quotes", accent: "#f59e0b" },
  { key: "activeQuotes" as const, label: "Active Quotes", icon: FileText, href: "/dashboard/quotes", accent: "#10b981" },
  { key: "upcomingEvents" as const, label: "Upcoming Events", icon: CalendarDays, href: "/dashboard/events", accent: "#ec4899" },
  { key: "totalClients" as const, label: "Total Clients", icon: Users, href: "/dashboard/clients", accent: "#3b82f6" },
];

async function StatsSection() {
  const stats = await getDashboardStats();
  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {cardConfig.map(({ key, label, icon: Icon, href, accent }) => (
          <Link key={key} href={href} aria-label={`${label}: ${stats[key]}`}>
            <div className="group rounded-2xl bg-white border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl border"
                  style={{ background: `${accent}15`, borderColor: `${accent}30` }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color: accent }} aria-hidden="true" />
                </div>
                <span className="text-3xl font-bold" style={{ color: accent }}>{stats[key]}</span>
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent quotes */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent Quotes</h2>
          <Link
            href="/dashboard/quotes"
            className="text-xs text-brand hover:text-brand/80 transition-colors font-medium"
          >
            View all →
          </Link>
        </div>
        {stats.recentQuotes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-400">No quotes yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Quote #", "Client", "Status", "Items"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/dashboard/quotes/${q.id}`}
                        className="font-medium text-slate-900 hover:text-brand transition-colors"
                      >
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{q.client.name}</td>
                    <td className="px-6 py-3.5">
                      <QuoteStatusBadge status={q.status} />
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">{q._count.items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "New Quote", href: "/dashboard/quotes/new" },
            { label: "Add Client", href: "/dashboard/clients" },
            { label: "Log Stock Movement", href: "/dashboard/assets" },
            { label: "View Events", href: "/dashboard/events" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:border-brand/30 hover:text-brand hover:bg-brand/5 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function StatsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-8 w-10" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 leading-tight">Dashboard</h1>
        <p className="font-serif italic text-slate-400 mt-1">Overview of your event rental operations</p>
      </div>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
    </div>
  );
}
