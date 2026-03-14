"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  FileText,
  Pencil,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EditClientDrawer from "@/components/clients/EditClientDrawer";
import type { Client, QuoteStatus, UserRole } from "@/types";

const statusStyles: Record<QuoteStatus, { bg: string; text: string; border: string; dot: string }> = {
  DRAFT:            { bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400"  },
  PENDING_APPROVAL: { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400"  },
  APPROVED:         { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-500" },
  INVOICED:         { bg: "bg-brand/8",    text: "text-brand",      border: "border-brand/20",   dot: "bg-brand"      },
  CANCELLED:        { bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200",    dot: "bg-red-400"    },
};

const statusLabel: Record<QuoteStatus, string> = {
  DRAFT: "Draft", PENDING_APPROVAL: "Pending", APPROVED: "Approved",
  INVOICED: "Invoiced", CANCELLED: "Cancelled",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
}

function ContactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200">
      <div className="w-8 h-8 rounded-xl bg-brand/8 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-slate-800 mt-0.5 break-words">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function ClientDetailClient({
  client,
  role,
}: {
  client: Client;
  role: UserRole;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const quoteCount = client.quotes?.length ?? client._count?.quotes ?? 0;

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          All Clients
        </Link>

        {/* Hero card */}
        <div className="rounded-3xl bg-linear-to-br from-brand to-brand-dark p-8 relative overflow-hidden">
          <div aria-hidden="true" className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div aria-hidden="true" className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shrink-0">
                {client.isCorporate ? getInitials(client.name) : <User className="h-7 w-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-white leading-tight">{client.name}</h1>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      client.isCorporate
                        ? "bg-white/15 border-white/20 text-white"
                        : "bg-white/10 border-white/15 text-white/80"
                    }`}
                  >
                    {client.isCorporate
                      ? <><Building2 className="h-3 w-3" />Corporate</>
                      : <><User className="h-3 w-3" />Individual</>}
                  </span>
                </div>
                {client.isCorporate && client.contactPerson && (
                  <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Contact: {client.contactPerson}
                  </p>
                )}
                {client.createdAt && (
                  <p className="text-white/40 text-xs mt-2 flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" />
                    Client since {formatDate(client.createdAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center bg-white/10 border border-white/15 rounded-2xl px-5 py-3">
                <p className="text-2xl font-bold text-white">{quoteCount}</p>
                <p className="text-xs text-white/50 mt-0.5">Quotes</p>
              </div>
              {role === "ADMIN" && (
                <Button
                  onClick={() => setEditOpen(true)}
                  className="rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 gap-2 backdrop-blur-sm"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Contact grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ContactCard icon={Mail} label="Email" value={client.email} />
          <ContactCard icon={Phone} label="Phone" value={client.phone} />
          <ContactCard icon={MapPin} label="Address" value={client.address} />
          {client.isCorporate ? (
            <ContactCard icon={Users} label="Contact Person" value={client.contactPerson} />
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>

        {/* Quotes history */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">
                Quotes
                <span className="ml-1.5 text-slate-400 font-normal">({quoteCount})</span>
              </h2>
            </div>
          </div>

          {!client.quotes || client.quotes.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">No quotes yet</p>
              <p className="text-xs text-slate-400">Quotes linked to this client will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {client.quotes.map((q) => {
                const s = statusStyles[q.status];
                return (
                  <Link
                    key={q.id}
                    href={`/dashboard/quotes/${q.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <span className="font-mono text-sm font-semibold text-slate-800">{q.quoteNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {statusLabel[q.status]}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {role === "ADMIN" && (
        <EditClientDrawer client={client} open={editOpen} onClose={() => setEditOpen(false)} />
      )}
    </>
  );
}
