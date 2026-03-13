"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateQuote } from "@/actions/quotes";
import { toast } from "sonner";
import {
  CalendarDays,
  Phone,
  Mail,
  User,
  Pencil,
  Loader2,
} from "lucide-react";
import type { Quote } from "@/types";

const schema = Yup.object({
  eventStartDate: Yup.string(),
  eventEndDate: Yup.string(),
  globalDiscount: Yup.number().min(0).max(100),
  includeVat: Yup.boolean(),
  notes: Yup.string(),
});

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EditQuoteHeaderForm({ quote }: { quote: Quote }) {
  const role = useAppSelector((s) => s.session.role);
  const [editing, setEditing] = useState(false);

  const canEdit =
    role === "ADMIN" && (quote.status === "DRAFT" || quote.status === "PENDING_APPROVAL");

  const formik = useFormik({
    initialValues: {
      eventStartDate: quote.eventStartDate?.slice(0, 10) ?? "",
      eventEndDate: quote.eventEndDate?.slice(0, 10) ?? "",
      globalDiscount: parseFloat(quote.globalDiscount),
      includeVat: quote.includeVat,
      notes: quote.notes ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await updateQuote(quote.id, {
          eventStartDate: values.eventStartDate || null,
          eventEndDate: values.eventEndDate || null,
          globalDiscount: values.globalDiscount,
          includeVat: values.includeVat,
          notes: values.notes || null,
        });
        toast.success("Quote updated");
        setEditing(false);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update quote");
      }
    },
  });

  // ── Read mode ──────────────────────────────────────────────────────────────
  if (!editing) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Client section */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Client</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-300 shrink-0" />
              <span className="text-sm font-semibold text-slate-800">{quote.client.name}</span>
            </div>
            {quote.client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-300 shrink-0" />
                <span className="text-sm text-slate-500">{quote.client.email}</span>
              </div>
            )}
            {quote.client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-300 shrink-0" />
                <span className="text-sm text-slate-500">{quote.client.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quote details */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Details</p>
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-brand hover:text-brand-dark font-medium transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Event dates */}
            <div className="flex items-start gap-2">
              <CalendarDays className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Event dates</p>
                {quote.eventStartDate ? (
                  <p className="text-sm text-slate-700">
                    {fmt(quote.eventStartDate)}
                    {quote.eventEndDate && (
                      <span className="text-slate-400"> → {fmt(quote.eventEndDate)}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-slate-300">Not set</p>
                )}
              </div>
            </div>

            {/* Discount + VAT */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-xs text-slate-400">Discount</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {parseFloat(quote.globalDiscount) > 0
                    ? `${quote.globalDiscount}%`
                    : "None"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-xs text-slate-400">VAT</p>
                <p className={`text-sm font-semibold mt-0.5 ${quote.includeVat ? "text-emerald-600" : "text-slate-400"}`}>
                  {quote.includeVat ? "Yes (16%)" : "No"}
                </p>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-xs text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-600 whitespace-pre-line">{quote.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
        Edit Quote Details
      </p>

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="eq-start" className="text-sm font-medium text-slate-600">Event start</Label>
            <Input
              id="eq-start"
              type="date"
              {...formik.getFieldProps("eventStartDate")}
              className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eq-end" className="text-sm font-medium text-slate-600">Event end</Label>
            <Input
              id="eq-end"
              type="date"
              {...formik.getFieldProps("eventEndDate")}
              className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="eq-disc" className="text-sm font-medium text-slate-600">
              Discount <span className="text-slate-400 font-normal text-xs">(%)</span>
            </Label>
            <Input
              id="eq-disc"
              type="number"
              min={0}
              max={100}
              {...formik.getFieldProps("globalDiscount")}
              className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">VAT (16%)</Label>
            <button
              type="button"
              onClick={() => formik.setFieldValue("includeVat", !formik.values.includeVat)}
              className={`flex w-full items-center justify-between h-10 px-3 rounded-xl border text-sm font-medium transition-colors ${
                formik.values.includeVat
                  ? "border-brand/30 bg-brand/5 text-brand"
                  : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              <span>{formik.values.includeVat ? "Included" : "Not included"}</span>
              <div
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  formik.values.includeVat ? "bg-brand" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    formik.values.includeVat ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eq-notes" className="text-sm font-medium text-slate-600">Notes</Label>
          <Textarea
            id="eq-notes"
            rows={3}
            {...formik.getFieldProps("notes")}
            className="rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25 resize-none"
          />
        </div>

        <div className="flex gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={() => { formik.resetForm(); setEditing(false); }}
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="flex-1 rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold disabled:opacity-60 gap-1.5"
          >
            {formik.isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
