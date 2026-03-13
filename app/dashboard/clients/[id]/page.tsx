import { serverFetch } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Building2, User, Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Client, QuoteStatus } from "@/types";

const statusStyles: Record<QuoteStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  INVOICED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-600",
};

const statusLabel: Record<QuoteStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending",
  APPROVED: "Approved",
  INVOICED: "Invoiced",
  CANCELLED: "Cancelled",
};

async function getClient(id: string): Promise<Client | null> {
  const res = await serverFetch(`/clients/${id}`, { next: { tags: ["clients"] } });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200/50 flex items-center justify-center shrink-0">
          {client.isCorporate
            ? <Building2 className="h-6 w-6 text-gray-400" />
            : <User className="h-6 w-6 text-gray-400" />
          }
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-white">{client.name}</h1>
            {client.isCorporate && (
              <Badge variant="outline" className="border-[#1e293b] text-gray-400">Corporate</Badge>
            )}
          </div>
          {client.contactPerson && (
            <p className="text-sm text-gray-400 mt-0.5">Contact: {client.contactPerson}</p>
          )}
        </div>
      </div>

      {/* Contact details */}
      <div className="rounded-2xl bg-white p-5 grid grid-cols-3 gap-4">
        <div className="flex items-start gap-2.5">
          <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
            <p className="text-sm text-gray-500 mt-0.5">{client.email ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
            <p className="text-sm text-gray-500 mt-0.5">{client.phone ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Address</p>
            <p className="text-sm text-gray-500 mt-0.5">{client.address ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Quotes */}
      {client.quotes && (
        <div className="rounded-2xl bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-500">Quotes ({client.quotes.length})</h2>
          </div>
          {client.quotes.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No quotes for this client yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Quote #</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Items</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Event dates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/quotes/${q.id}`}
                        className="font-medium text-white hover:text-indigo-600 transition-colors"
                      >
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[q.status]}`}>
                        {statusLabel[q.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{q._count.items}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {q.eventStartDate
                        ? `${new Date(q.eventStartDate).toLocaleDateString("en-KE")} – ${q.eventEndDate ? new Date(q.eventEndDate).toLocaleDateString("en-KE") : "?"}`
                        : "—"
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
