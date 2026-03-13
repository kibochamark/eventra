"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";
import Link from "next/link";
import QuoteStatusBadge from "./QuoteStatusBadge";
import type { QuoteListItem, QuoteStatus } from "@/types";

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_FILTERS: { label: string; value: QuoteStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Invoiced", value: "INVOICED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function QuoteTableClient({ quotes }: { quotes: QuoteListItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "ALL">("ALL");

  const stats = useMemo(() => ({
    total: quotes.length,
    draft: quotes.filter((q) => q.status === "DRAFT").length,
    pending: quotes.filter((q) => q.status === "PENDING_APPROVAL").length,
    approved: quotes.filter((q) => q.status === "APPROVED").length,
  }), [quotes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return quotes.filter((quote) => {
      const matchesSearch =
        !q ||
        quote.quoteNumber.toLowerCase().includes(q) ||
        quote.client.name.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Quotes", value: stats.total, color: "text-slate-900" },
          { label: "Drafts", value: stats.draft, color: "text-slate-500" },
          { label: "Pending Approval", value: stats.pending, color: "text-amber-600" },
          { label: "Approved", value: stats.approved, color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
            <Input
              placeholder="Search quote # or client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl border-slate-200 text-sm focus-visible:border-brand focus-visible:ring-brand/25"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-brand text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Link href="/dashboard/quotes/new" className="ml-auto shrink-0">
            <Button
              size="sm"
              className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/30 gap-1.5 h-9 px-4"
            >
              <Plus className="h-3.5 w-3.5" />
              New Quote
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Quote #
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Client
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                  Event Dates
                </th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wide hidden md:table-cell">
                  Items
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-brand/5 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-brand/40" />
                      </div>
                      <p className="text-sm text-slate-400">
                        {quotes.length === 0
                          ? "No quotes yet. Create your first one."
                          : "No quotes match your filters."}
                      </p>
                      {quotes.length === 0 && (
                        <Link href="/dashboard/quotes/new">
                          <Button
                            size="sm"
                            className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white gap-1.5 mt-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            New Quote
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/quotes/${q.id}`}
                        className="font-semibold text-brand hover:text-brand-dark transition-colors font-mono text-sm"
                      >
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {q.client.name}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs hidden sm:table-cell">
                      {q.eventStartDate ? (
                        <span>
                          {fmt(q.eventStartDate)}
                          {q.eventEndDate && (
                            <span className="text-slate-300"> → {fmt(q.eventEndDate)}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center text-slate-500 hidden md:table-cell">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-xs font-medium">
                        {q._count.items}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <QuoteStatusBadge status={q.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/quotes/${q.id}`}
                        className="text-xs font-medium text-slate-400 hover:text-brand transition-colors opacity-0 group-hover:opacity-100"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {quotes.length} quote{quotes.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
