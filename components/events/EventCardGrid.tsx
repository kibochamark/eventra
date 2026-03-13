import Link from "next/link";
import { CalendarDays, MapPin, ExternalLink } from "lucide-react";
import type { EventDetail, EventStatus } from "@/types";

type StatusCfg = {
  label: string;
  headerClass: string;
  dotClass: string;
  glow: boolean;
};

const statusConfig: Record<EventStatus, StatusCfg> = {
  UPCOMING: {
    label: "Upcoming",
    headerClass: "from-[#1e2a4a] to-[#0f172a]",
    dotClass: "bg-blue-400",
    glow: true,
  },
  ACTIVE: {
    label: "Active",
    headerClass: "from-[#0d2a1e] to-[#0a0a0a]",
    dotClass: "bg-emerald-400",
    glow: true,
  },
  COMPLETED: {
    label: "Completed",
    headerClass: "from-[#1a1a1a] to-[#0d0d0d]",
    dotClass: "bg-slate-500",
    glow: false,
  },
  CANCELLED: {
    label: "Cancelled",
    headerClass: "from-[#2a0f0f] to-[#0d0d0d]",
    dotClass: "bg-red-500",
    glow: false,
  },
};

function EventCard({ event }: { event: EventDetail }) {
  const cfg = statusConfig[event.status];

  const inner = (
    <div className="relative rounded-2xl bg-[#121212] flex flex-col overflow-hidden h-full">
      {/* Coloured header band */}
      <div className={`bg-linear-to-br ${cfg.headerClass} px-5 py-6`}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
            {event.name}
          </h3>
          <span
            className={`mt-0.5 flex h-2 w-2 shrink-0 rounded-full ${cfg.dotClass} ring-2 ring-black/40`}
            aria-label={cfg.label}
          />
        </div>
        <span className="mt-2 inline-block text-xs text-[#475569] font-medium">{cfg.label}</span>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-4 space-y-2.5">
        <div className="flex items-start gap-2 text-xs text-[#94a3b8]">
          <CalendarDays className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#475569]" aria-hidden="true" />
          <span>
            {new Date(event.startDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
            {" – "}
            {new Date(event.endDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-start gap-2 text-xs text-[#94a3b8]">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#475569]" aria-hidden="true" />
          <span className="truncate">{event.venue ?? "Venue TBD"}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e293b]/60 px-5 py-3 flex items-center justify-between">
        {event.quote ? (
          <Link
            href={`/dashboard/quotes/${event.quote.id}`}
            className="text-xs text-[#b9c0ff] font-medium hover:text-white transition-colors inline-flex items-center gap-1"
            aria-label={`View quote ${event.quote.quoteNumber}`}
          >
            {event.quote.quoteNumber}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : (
          <span className="text-xs text-[#1e293b]">No quote</span>
        )}
        <Link
          href={`/dashboard/events/${event.id}`}
          className="text-xs text-[#475569] hover:text-[#b9c0ff] transition-colors font-medium"
          aria-label={`View event details for ${event.name}`}
        >
          View →
        </Link>
      </div>
    </div>
  );

  if (cfg.glow) {
    return (
      <article aria-label={`${event.name} — ${cfg.label}`} className="relative">
        {/* Glow halo */}
        <div
          className="absolute -inset-px rounded-2xl blur-lg opacity-20 bg-[#b9c0ff] pointer-events-none"
          aria-hidden="true"
        />
        {/* Animated conic border */}
        <div
          className="relative rounded-2xl p-px aura-spin"
          style={{
            background: "conic-gradient(from var(--angle), #b9c0ff, transparent 40%, #b9c0ff)",
          }}
          aria-hidden="true"
        >
          {inner}
        </div>
      </article>
    );
  }

  return (
    <article
      aria-label={`${event.name} — ${cfg.label}`}
      className="rounded-2xl border border-[#1e293b]/60 overflow-hidden hover:border-[#1e293b] transition-colors"
    >
      {inner}
    </article>
  );
}

export default function EventCardGrid({ events }: { events: EventDetail[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl bg-[#121212] border border-[#1e293b]/60 px-6 py-16 text-center">
        <p className="text-sm text-[#475569]">No events found.</p>
        <p className="font-serif italic text-xs text-[#1e293b] mt-1">Events appear when a quote is approved.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
