import { Suspense } from "react";
import { serverFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import EventCardGrid from "@/components/events/EventCardGrid";
import EventStatusTabs from "@/components/events/EventStatusTabs";
import type { EventDetail, EventStatus, QuoteListItem } from "@/types";

async function getEvents(): Promise<EventDetail[]> {
  const res = await serverFetch("/events", { next: { tags: ["events"] } });
  if (res.ok) return res.json();

  const quotesRes = await serverFetch("/quotes", { next: { tags: ["quotes"] } });
  if (!quotesRes.ok) return [];
  const quotes: QuoteListItem[] = await quotesRes.json();

  const seen = new Set<string>();
  const events: EventDetail[] = [];
  for (const q of quotes) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evts: Array<{ id: string; name: string; status: EventStatus }> = (q as any).events ?? [];
    for (const e of evts) {
      if (!seen.has(e.id)) {
        seen.add(e.id);
        events.push({
          id: e.id,
          name: e.name,
          venue: null,
          startDate: q.eventStartDate ?? "",
          endDate: q.eventEndDate ?? "",
          status: e.status,
          quote: { id: q.id, quoteNumber: q.quoteNumber, status: q.status, includeVat: q.includeVat, globalDiscount: q.globalDiscount, eventStartDate: q.eventStartDate, eventEndDate: q.eventEndDate, client: q.client, _count: q._count },
        });
      }
    }
  }
  return events;
}

async function EventsSection({ filter }: { filter: EventStatus | "ALL" }) {
  const events = await getEvents();
  const filtered = filter === "ALL" ? events : events.filter((e) => e.status === filter);
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</p>
      <EventCardGrid events={filtered} />
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <Skeleton className="h-24 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="border-t border-gray-100 px-5 py-3 flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

const VALID_STATUSES: EventStatus[] = ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const rawStatus = params.status?.toUpperCase();
  const filter: EventStatus | "ALL" = VALID_STATUSES.includes(rawStatus as EventStatus)
    ? (rawStatus as EventStatus)
    : "ALL";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="text-sm text-gray-400 mt-0.5">Events are created automatically when a quote is approved.</p>
      </div>

      <Suspense fallback={<div className="flex gap-1 rounded-2xl bg-white shadow-sm p-1.5 w-fit"><div className="h-9 w-20 rounded-xl bg-gray-100 animate-pulse" /><div className="h-9 w-20 rounded-xl bg-gray-100 animate-pulse" /><div className="h-9 w-20 rounded-xl bg-gray-100 animate-pulse" /><div className="h-9 w-24 rounded-xl bg-gray-100 animate-pulse" /><div className="h-9 w-20 rounded-xl bg-gray-100 animate-pulse" /></div>}>
        <EventStatusTabs active={filter} />
      </Suspense>

      <Suspense fallback={<EventsSkeleton />}>
        <EventsSection filter={filter} />
      </Suspense>
    </div>
  );
}
