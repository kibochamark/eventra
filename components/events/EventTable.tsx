import Link from "next/link";
import EventStatusBadge from "./EventStatusBadge";
import type { EventDetail } from "@/types";

export default function EventTable({ events }: { events: EventDetail[] }) {
  return (
    <div className="rounded-2xl bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Event</th>
            <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Venue</th>
            <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Dates</th>
            <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Quote</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                No events yet. Events are created when a quote is approved.
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="font-medium text-white hover:text-indigo-600 transition-colors"
                  >
                    {event.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <EventStatusBadge status={event.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">{event.venue ?? "—"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(event.startDate).toLocaleDateString("en-KE")}
                  {" – "}
                  {new Date(event.endDate).toLocaleDateString("en-KE")}
                </td>
                <td className="px-4 py-3">
                  {event.quote ? (
                    <Link
                      href={`/dashboard/quotes/${event.quote.id}`}
                      className="text-indigo-600 hover:text-white transition-colors text-xs"
                    >
                      {event.quote.quoteNumber}
                    </Link>
                  ) : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
