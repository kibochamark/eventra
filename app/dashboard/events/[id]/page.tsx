import { serverFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar } from "lucide-react";
import EventStatusBadge from "@/components/events/EventStatusBadge";
import ServiceBucketCard from "@/components/events/ServiceBucketCard";
import type { EventDetail } from "@/types";

async function getEvent(id: string): Promise<EventDetail | null> {
  const res = await serverFetch(`/events/${id}`, { next: { tags: ["events"] } });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-white">{event.name}</h1>
            <EventStatusBadge status={event.status} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            {event.venue && (
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                {event.venue}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(event.startDate).toLocaleDateString("en-KE")}
              {" – "}
              {new Date(event.endDate).toLocaleDateString("en-KE")}
            </span>
          </div>
        </div>

        {event.quote && (
          <Link
            href={`/quotes/${event.quote.id}`}
            className="text-sm text-indigo-600 hover:text-white transition-colors"
          >
            View quote {event.quote.quoteNumber}
          </Link>
        )}
      </div>

      {/* Service bucket */}
      {event.serviceBucket ? (
        <ServiceBucketCard bucket={event.serviceBucket} />
      ) : (
        <div className="rounded-2xl bg-white px-5 py-12 text-center text-sm text-gray-400">
          No service bucket data available for this event.
        </div>
      )}
    </div>
  );
}
