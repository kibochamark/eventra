import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import QuoteTableClient from "@/components/quotes/QuoteTableClient";
import type { QuoteListItem } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

async function QuotesSection() {
  const session = await auth.api.getSession({ headers: await headers() });
  const token = session?.session.token;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API_BASE}/quotes`, {
    headers: authHeader,
    next: { tags: ["quotes"] },
  });
  const quotes: QuoteListItem[] = res.ok ? await res.json() : [];

  return <QuoteTableClient quotes={quotes} />;
}

function QuotesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-10" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuotesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 leading-tight">Quotes</h1>
        <p className="font-serif italic text-slate-400 mt-1">
          Draft, review, and approve rental proposals for your clients.
        </p>
      </div>
      <Suspense fallback={<QuotesSkeleton />}>
        <QuotesSection />
      </Suspense>
    </div>
  );
}
