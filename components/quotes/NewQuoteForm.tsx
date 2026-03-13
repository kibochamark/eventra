"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createQuote } from "@/actions/quotes";
import { toast } from "sonner";
import { Search, Plus, Building2, User, Loader2, ChevronDown, X } from "lucide-react";
import CreateClientDialog from "./CreateClientDialog";
import type { Client } from "@/types";

const schema = Yup.object({
  clientId: Yup.string().required("Select a client"),
  eventStartDate: Yup.string(),
  eventEndDate: Yup.string(),
  notes: Yup.string(),
});

export default function NewQuoteForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const role = useAppSelector((s) => s.session.role);

  // Client combobox state
  const [clientSearch, setClientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [allClients, setAllClients] = useState<Client[]>(clients);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase().trim();
    if (!q) return allClients.slice(0, 20);
    return allClients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
      )
      .slice(0, 20);
  }, [allClients, clientSearch]);

  function handleSelectClient(client: Client) {
    setSelectedClient(client);
    formik.setFieldValue("clientId", client.id);
    setClientSearch(client.name);
    setShowDropdown(false);
  }

  function handleClearClient() {
    setSelectedClient(null);
    formik.setFieldValue("clientId", "");
    setClientSearch("");
  }

  function handleClientCreated(client: Client) {
    setAllClients((prev) => [client, ...prev]);
    handleSelectClient(client);
    setCreateClientOpen(false);
  }

  const formik = useFormik({
    initialValues: {
      clientId: "",
      eventStartDate: "",
      eventEndDate: "",
      notes: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const quote = await createQuote({
          clientId: values.clientId,
          eventStartDate: values.eventStartDate || null,
          eventEndDate: values.eventEndDate || null,
          notes: values.notes || null,
        });
        toast.success("Quote created — add items to get started.");
        router.push(`/dashboard/quotes/${quote.id}`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create quote");
      }
    },
  });

  const fieldErr = (field: keyof typeof formik.errors) =>
    formik.touched[field] && formik.errors[field] ? (
      <p className="text-xs text-red-500 mt-1">{formik.errors[field]}</p>
    ) : null;

  return (
    <>
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Client selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-600">
              Client <span className="text-red-400">*</span>
            </Label>
            {role === "ADMIN" ? (
              <button
                type="button"
                onClick={() => setCreateClientOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-brand hover:text-brand-dark font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New client
              </button>
            ) : (
              <span className="text-xs text-slate-400">Ask an admin to add new clients.</span>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <div
              className={`flex items-center rounded-xl border bg-white transition-colors ${
                formik.touched.clientId && formik.errors.clientId
                  ? "border-red-400"
                  : showDropdown
                  ? "border-brand ring-3 ring-brand/15"
                  : "border-slate-200"
              }`}
            >
              <Search className="shrink-0 ml-3 h-4 w-4 text-slate-300" />
              <input
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 px-3 py-2.5 outline-none"
                placeholder="Search clients by name, email or phone…"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowDropdown(true);
                  if (selectedClient && e.target.value !== selectedClient.name) {
                    setSelectedClient(null);
                    formik.setFieldValue("clientId", "");
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
              {selectedClient ? (
                <button
                  type="button"
                  onClick={handleClearClient}
                  className="mr-3 text-slate-300 hover:text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <ChevronDown className="shrink-0 mr-3 h-4 w-4 text-slate-300" />
              )}
            </div>

            {showDropdown && (
              <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 overflow-hidden">
                {filteredClients.length === 0 ? (
                  <div className="px-4 py-5 text-center">
                    <p className="text-sm text-slate-400 mb-2">
                      No clients found for &ldquo;{clientSearch}&rdquo;
                    </p>
                    {role === "ADMIN" && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setShowDropdown(false);
                          setCreateClientOpen(true);
                        }}
                        className="text-xs text-brand font-medium hover:underline"
                      >
                        + Create &ldquo;{clientSearch}&rdquo; as new client
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className="max-h-60 overflow-y-auto py-1">
                    {filteredClients.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectClient(c);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-brand/5 transition-colors"
                        >
                          <div className="h-7 w-7 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                            {c.isCorporate ? (
                              <Building2 className="h-3.5 w-3.5 text-brand" />
                            ) : (
                              <User className="h-3.5 w-3.5 text-brand" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                            {c.email && (
                              <p className="text-xs text-slate-400 truncate">{c.email}</p>
                            )}
                          </div>
                          {c.isCorporate && (
                            <span className="shrink-0 text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded-full font-medium">
                              Corp
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {selectedClient && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand/5 border border-brand/15">
              <div className="h-6 w-6 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                {selectedClient.isCorporate ? (
                  <Building2 className="h-3 w-3 text-brand" />
                ) : (
                  <User className="h-3 w-3 text-brand" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-brand">{selectedClient.name}</span>
                {selectedClient.email && (
                  <span className="text-xs text-slate-400 ml-2">{selectedClient.email}</span>
                )}
              </div>
            </div>
          )}

          {fieldErr("clientId")}
        </div>

        {/* Event dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nq-start" className="text-sm font-medium text-slate-600">
              Event start <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </Label>
            <Input
              id="nq-start"
              type="date"
              {...formik.getFieldProps("eventStartDate")}
              className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nq-end" className="text-sm font-medium text-slate-600">
              Event end <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </Label>
            <Input
              id="nq-end"
              type="date"
              {...formik.getFieldProps("eventEndDate")}
              className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="nq-notes" className="text-sm font-medium text-slate-600">
            Notes <span className="text-slate-400 font-normal text-xs">(optional)</span>
          </Label>
          <Textarea
            id="nq-notes"
            rows={3}
            placeholder="Any additional details for this quote…"
            {...formik.getFieldProps("notes")}
            className="rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25 resize-none"
          />
        </div>

        <p className="text-xs text-slate-400">
          VAT and discount can be configured after creation on the quote detail page.
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={() => router.back()}
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={formik.isSubmitting || !formik.values.clientId}
            onClick={() => formik.handleSubmit()}
            className="flex-1 rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/30 disabled:opacity-60 gap-1.5"
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create Quote"
            )}
          </Button>
        </div>
      </div>

      <CreateClientDialog
        open={createClientOpen}
        initialName={clientSearch}
        onClose={() => setCreateClientOpen(false)}
        onCreated={handleClientCreated}
      />
    </>
  );
}
