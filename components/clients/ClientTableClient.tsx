"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { openClientSheet } from "@/lib/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Building2, User } from "lucide-react";
import Link from "next/link";
import { deleteClient } from "@/actions/clients";
import { toast } from "sonner";
import type { Client } from "@/types";

export default function ClientTableClient({ clients }: { clients: Client[] }) {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.session.role);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete client "${name}"? This cannot be undone.`)) return;
    try {
      await deleteClient(id);
      toast.success("Client deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete client");
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{clients.length} clients</p>
        {role === "ADMIN" && (
          <Button
            size="sm"
            className="rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 gap-1.5"
            onClick={() => dispatch(openClientSheet(null))}
          >
            <Plus className="h-3.5 w-3.5" />
            Add client
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Client</th>
              <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-gray-400 text-xs uppercase tracking-wide">Quotes</th>
              <th className="px-4 py-3 text-right font-medium text-gray-400 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">
                  No clients yet. {role === "ADMIN" && "Click \"Add client\" to create one."}
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gray-200/50 flex items-center justify-center shrink-0">
                        {client.isCorporate
                          ? <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          : <User className="h-3.5 w-3.5 text-gray-400" />
                        }
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="font-medium text-white hover:text-indigo-600 transition-colors"
                        >
                          {client.name}
                        </Link>
                        {client.isCorporate && (
                          <Badge variant="outline" className="ml-1.5 text-xs py-0 h-4 border-[#1e293b] text-gray-400">Corp</Badge>
                        )}
                        {client.contactPerson && (
                          <p className="text-xs text-gray-400 mt-0.5">{client.contactPerson}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <div className="text-xs space-y-0.5">
                      {client.email && <p>{client.email}</p>}
                      {client.phone && <p>{client.phone}</p>}
                      {!client.email && !client.phone && <span className="text-[#1e293b]">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {client._count?.quotes ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {role === "ADMIN" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600"
                            onClick={() => dispatch(openClientSheet(client.id))}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
