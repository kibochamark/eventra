"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { useAppDispatch } from "@/lib/hooks";
import { openAddQuoteItemSheet } from "@/lib/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateQuoteItem, removeQuoteItem } from "@/actions/quotes";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Package2 } from "lucide-react";
import type { QuoteItem, QuoteStatus, ItemType } from "@/types";

const TYPE_BADGE: Record<ItemType, string> = {
  RENTAL: "bg-brand/10 text-brand",
  SALE:   "bg-emerald-100 text-emerald-700",
  SERVICE: "bg-amber-100 text-amber-700",
};

function fmt(v: string | number) {
  return `KES ${parseFloat(String(v)).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function lineTotal(item: QuoteItem) {
  const rate = parseFloat(item.rate);
  const disc = parseFloat(item.discountAmount);
  if (item.type === "RENTAL") return rate * item.quantity * item.days - disc;
  return rate * item.quantity - disc;
}

// ── Edit item dialog ─────────────────────────────────────────────────────────

function EditItemDialog({
  item,
  quoteId,
  onClose,
}: {
  item: QuoteItem;
  quoteId: string;
  onClose: () => void;
}) {
  const role = useAppSelector((s) => s.session.role);

  const schema = Yup.object({
    description: Yup.string().min(2).required("Required"),
    quantity: Yup.number().integer().min(1).required("Required"),
    days: Yup.number().integer().min(1).required("Required"),
    discountAmount: Yup.number().min(0),
  });

  const formik = useFormik({
    initialValues: {
      description: item.description,
      quantity: item.quantity,
      days: item.days,
      discountAmount: parseFloat(item.discountAmount),
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const payload: Record<string, unknown> = {
          description: values.description,
          quantity: values.quantity,
          days: values.days,
        };
        if (role === "ADMIN") payload.discountAmount = values.discountAmount;
        await updateQuoteItem(quoteId, item.id, payload);
        toast.success("Item updated");
        onClose();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update item");
      }
    },
  });

  const fieldErr = (f: keyof typeof formik.errors) =>
    formik.touched[f] && formik.errors[f] ? (
      <p className="text-xs text-red-500 mt-1">{formik.errors[f]}</p>
    ) : null;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-sm bg-white border-slate-200 rounded-3xl p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-lg font-bold">Edit Item</DialogTitle>
          </DialogHeader>
          {/* Rate is display-only — price-locked */}
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span>Rate:</span>
            <span className="font-medium text-slate-600">{fmt(item.rate)}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px]">locked</span>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ei-desc" className="text-sm font-medium text-slate-600">Description</Label>
            <Input
              id="ei-desc"
              {...formik.getFieldProps("description")}
              className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
            {fieldErr("description")}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ei-qty" className="text-sm font-medium text-slate-600">Qty</Label>
              <Input
                id="ei-qty"
                type="number"
                min={1}
                {...formik.getFieldProps("quantity")}
                className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
              />
              {fieldErr("quantity")}
            </div>
            {item.type === "RENTAL" && (
              <div className="space-y-1.5">
                <Label htmlFor="ei-days" className="text-sm font-medium text-slate-600">Days</Label>
                <Input
                  id="ei-days"
                  type="number"
                  min={1}
                  {...formik.getFieldProps("days")}
                  className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
                />
                {fieldErr("days")}
              </div>
            )}
          </div>

          {role === "ADMIN" && (
            <div className="space-y-1.5">
              <Label htmlFor="ei-disc" className="text-sm font-medium text-slate-600">
                Item discount <span className="text-slate-400 font-normal text-xs">(KES)</span>
              </Label>
              <Input
                id="ei-disc"
                type="number"
                min={0}
                {...formik.getFieldProps("discountAmount")}
                className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
              />
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={onClose}
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
      </DialogContent>
    </Dialog>
  );
}

// ── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({
  item,
  quoteId,
  onClose,
}: {
  item: QuoteItem;
  quoteId: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await removeQuoteItem(quoteId, item.id);
      toast.success("Item removed");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-xs bg-white border-slate-200 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg font-bold">Remove item?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 mt-2">
          &ldquo;{item.description}&rdquo; will be permanently removed from this quote.
        </p>
        <div className="flex gap-2.5 mt-5">
          <Button
            variant="outline"
            className="flex-1 rounded-full border-slate-200 text-slate-600"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold gap-1.5 disabled:opacity-60"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main table ───────────────────────────────────────────────────────────────

export default function QuoteItemsTable({
  items,
  quoteId,
  status,
}: {
  items: QuoteItem[];
  quoteId: string;
  status: QuoteStatus;
}) {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.session.role);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<QuoteItem | null>(null);

  const isDraft = status === "DRAFT";

  return (
    <>
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Line Items</h2>
            <p className="text-xs text-slate-400 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
          {isDraft && (
            <Button
              size="sm"
              onClick={() => dispatch(openAddQuoteItemSheet(quoteId))}
              className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/20 gap-1.5 h-8 px-3 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add item
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-5 gap-3">
            <div className="h-12 w-12 rounded-full bg-brand/5 flex items-center justify-center">
              <Package2 className="h-6 w-6 text-brand/30" />
            </div>
            <p className="text-sm text-slate-400 text-center">No items yet.</p>
            {isDraft && (
              <Button
                size="sm"
                onClick={() => dispatch(openAddQuoteItemSheet(quoteId))}
                className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white gap-1.5 mt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add first item
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Description</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell">Type</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Qty</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide hidden md:table-cell">Days</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell">Rate</th>
                  {role === "ADMIN" && (
                    <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide hidden lg:table-cell">Discount</th>
                  )}
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide">Total</th>
                  {isDraft && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{item.description}</p>
                      {item.asset && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.asset.name}
                          {item.asset.sku && <span className="ml-1 font-mono text-slate-300">#{item.asset.sku}</span>}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[item.type]}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{item.quantity}</td>
                    <td className="px-5 py-3.5 text-right text-slate-400 hidden md:table-cell">
                      {item.type === "RENTAL" ? item.days : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 hidden sm:table-cell">{fmt(item.rate)}</td>
                    {role === "ADMIN" && (
                      <td className="px-5 py-3.5 text-right text-red-400 hidden lg:table-cell">
                        {parseFloat(item.discountAmount) > 0 ? `− ${fmt(item.discountAmount)}` : "—"}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                      {fmt(lineTotal(item))}
                    </td>
                    {isDraft && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand hover:bg-brand/5 transition-colors"
                            title="Edit item"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      {editingItem && (
        <EditItemDialog
          item={editingItem}
          quoteId={quoteId}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Delete confirm dialog */}
      {deletingItem && (
        <DeleteConfirmDialog
          item={deletingItem}
          quoteId={quoteId}
          onClose={() => setDeletingItem(null)}
        />
      )}
    </>
  );
}
