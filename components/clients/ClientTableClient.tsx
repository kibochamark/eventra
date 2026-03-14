"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  Search,
  Plus,
  ChevronRight,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { openClientSheet } from "@/lib/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Client } from "@/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type TypeFilter = "ALL" | "CORPORATE" | "INDIVIDUAL";

export default function ClientTableClient({ clients }: { clients: Client[] }) {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.session.role);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  const stats = useMemo(() => ({
    total: clients.length,
    corporate: clients.filter((c) => c.isCorporate).length,
    individual: clients.filter((c) => !c.isCorporate).length,
    withQuotes: clients.filter((c) => (c._count?.quotes ?? 0) > 0).length,
  }), [clients]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (typeFilter === "CORPORATE" && !c.isCorporate) return false;
      if (typeFilter === "INDIVIDUAL" && c.isCorporate) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.contactPerson?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [clients, typeFilter, search]);

  const typePills: { label: string; value: TypeFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Corporate", value: "CORPORATE" },
    { label: "Individual", value: "INDIVIDUAL" },
  ];

  return (
    <>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total clients", value: stats.total },
          { label: "Corporate", value: stats.corporate },
          { label: "Individual", value: stats.individual },
          { label: "Active quotes", value: stats.withQuotes },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        {/* Controls */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
            {typePills.map((p) => (
              <button
                key={p.value}
                onClick={() => setTypeFilter(p.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  typeFilter === p.value
                    ? "bg-brand text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients…"
                className="pl-8 h-8 w-52 text-sm rounded-full border-slate-200 bg-slate-50 focus-visible:ring-brand/30"
              />
            </div>
            {role === "ADMIN" && (
              <Button
                size="sm"
                onClick={() => dispatch(openClientSheet(null))}
                className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white hover:opacity-90 gap-1.5 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                New Client
              </Button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-brand/8 flex items-center justify-center mb-4">
              <User className="h-7 w-7 text-brand" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No clients found</h3>
            <p className="text-sm text-slate-400 mb-5">
              {search || typeFilter !== "ALL"
                ? "Try adjusting your search or filter."
                : "Add your first client to get started."}
            </p>
            {role === "ADMIN" && !search && typeFilter === "ALL" && (
              <Button
                size="sm"
                onClick={() => dispatch(openClientSheet(null))}
                className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Client
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Client", "Contact", "Quotes", ""].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((client) => (
                    <tr
                      key={client.id}
                      className="group hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Client name + type */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                              client.isCorporate
                                ? "bg-linear-to-br from-brand/20 to-brand/40 text-brand"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {client.isCorporate
                              ? getInitials(client.name)
                              : <User className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{client.name}</p>
                            {client.isCorporate && client.contactPerson && (
                              <p className="text-xs text-slate-400 mt-0.5">{client.contactPerson}</p>
                            )}
                          </div>
                          <span
                            className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                              client.isCorporate
                                ? "bg-brand/8 text-brand border-brand/20"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {client.isCorporate ? (
                              <><Building2 className="h-3 w-3 mr-1" />Corp</>
                            ) : (
                              <><User className="h-3 w-3 mr-1" />Indiv</>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-xs text-slate-500">
                          {client.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {client.phone}
                            </div>
                          )}
                          {!client.email && !client.phone && (
                            <span className="text-slate-300">—</span>
                          )}
                        </div>
                      </td>

                      {/* Quote count */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <FileText className="h-3 w-3" />
                          {client._count?.quotes ?? 0}
                        </span>
                      </td>

                      {/* View link */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-brand transition-colors"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filtered.map((client) => (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                      client.isCorporate
                        ? "bg-linear-to-br from-brand/20 to-brand/40 text-brand"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {client.isCorporate ? getInitials(client.name) : <User className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{client.name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {client.email ?? client.phone ?? (client.contactPerson ? `c/o ${client.contactPerson}` : "No contact")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        client.isCorporate
                          ? "bg-brand/8 text-brand border-brand/20"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {client.isCorporate ? "Corp" : "Indiv"}
                    </span>
                    <span className="text-xs text-slate-400">{client._count?.quotes ?? 0} quotes</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </>
  );
}
