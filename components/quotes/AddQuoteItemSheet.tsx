"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { closeAddQuoteItemSheet } from "@/lib/store/slices/uiSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addQuoteItem } from "@/actions/quotes";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Asset, ItemType } from "@/types";

const schema = Yup.object({
  type: Yup.string<ItemType>().required("Select a type"),
  description: Yup.string().min(2).required("Required"),
  quantity: Yup.number().integer().min(1).required("Required"),
  rate: Yup.number().min(0).required("Required"),
  days: Yup.number()
    .integer()
    .min(1)
    .when("type", {
      is: "RENTAL",
      then: (s) => s.required("Required"),
      otherwise: (s) => s.optional(),
    }),
  discountAmount: Yup.number().min(0),
  assetId: Yup.string(),
});

const TYPE_LABELS: Record<ItemType, string> = {
  RENTAL: "Rental",
  SALE: "Sale",
  SERVICE: "Service",
};

export default function AddQuoteItemSheet({ assets }: { assets: Asset[] }) {
  const dispatch = useAppDispatch();
  const { open, quoteId } = useAppSelector((s) => s.ui.addQuoteItemSheet);
  const role = useAppSelector((s) => s.session.role);

  const formik = useFormik({
    initialValues: {
      type: "" as ItemType,
      description: "",
      quantity: 1,
      rate: 0,
      days: 1,
      discountAmount: 0,
      assetId: "",
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      if (!quoteId) return;
      const payload: {
        type: string;
        description: string;
        quantity: number;
        rate: number;
        days?: number;
        assetId?: string;
        discountAmount?: number;
      } = {
        type: values.type,
        description: values.description,
        quantity: values.quantity,
        rate: values.rate,
      };
      if (values.type === "RENTAL") payload.days = values.days;
      if (values.assetId) payload.assetId = values.assetId;
      if (role === "ADMIN" && values.discountAmount > 0) {
        payload.discountAmount = values.discountAmount;
      }

      try {
        await addQuoteItem(quoteId, payload);
        toast.success("Item added");
        helpers.resetForm();
        dispatch(closeAddQuoteItemSheet());
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to add item");
      }
    },
  });

  function handleTypeChange(v: string | null) {
    if (!v) return;
    formik.setFieldValue("type", v);
    if (v === "SERVICE") {
      formik.setFieldValue("assetId", "");
    }
  }

  function handleAssetChange(v: string | null) {
    const id = !v || v === "__none__" ? "" : v;
    formik.setFieldValue("assetId", id);
    if (id) {
      const asset = assets.find((a) => a.id === id);
      if (asset) {
        formik.setFieldValue("description", asset.name);
        formik.setFieldValue("rate", asset.baseRentalRate);
      }
    }
  }

  function handleClose() {
    formik.resetForm();
    dispatch(closeAddQuoteItemSheet());
  }

  const fieldErr = (f: keyof typeof formik.errors) =>
    formik.touched[f] && formik.errors[f] ? (
      <p className="text-xs text-red-500 mt-1">{String(formik.errors[f])}</p>
    ) : null;

  const type = formik.values.type;
  const showAsset = type === "RENTAL" || type === "SALE";
  const showDays = type === "RENTAL";
  const selectedAssetLabel =
    formik.values.assetId && formik.values.assetId !== "__none__"
      ? assets.find((a) => a.id === formik.values.assetId)?.name ?? "Unknown asset"
      : "None";

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent className="sm:max-w-md bg-white border-slate-200 overflow-y-auto p-3">
        <SheetHeader className="pb-4 border-b border-slate-100">
          <SheetTitle className="text-slate-900 text-lg font-bold">Add Line Item</SheetTitle>
          <p className="text-sm text-slate-400">
            Add a {role === "ADMIN" ? "rental, sale, or service" : "rental or sale"} item to this quote.
          </p>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} noValidate className="mt-6 space-y-4">
          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">
              Type <span className="text-red-400">*</span>
            </Label>
            <Select
              value={type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger
                className={`w-full h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25 ${
                  formik.touched.type && formik.errors.type ? "border-red-300" : ""
                }`}
              >
                <span className="flex-1 text-left text-sm">
                  {type ? TYPE_LABELS[type] : <span className="text-slate-400">Select type…</span>}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RENTAL">Rental</SelectItem>
                <SelectItem value="SALE">Sale</SelectItem>
                {role === "ADMIN" && <SelectItem value="SERVICE">Service</SelectItem>}
              </SelectContent>
            </Select>
            {fieldErr("type")}
          </div>

          {/* Asset (RENTAL / SALE only) */}
          {showAsset && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">
                Asset <span className="text-slate-400 font-normal text-xs">(optional — auto-fills rate)</span>
              </Label>
              <Select
                value={formik.values.assetId || "__none__"}
                onValueChange={handleAssetChange}
              >
                <SelectTrigger className="w-full h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25">
                  <span className="flex-1 text-left text-sm truncate">
                    {selectedAssetLabel}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                      {a.sku && <span className="ml-1.5 text-xs text-slate-400 font-mono">#{a.sku}</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="qi-desc" className="text-sm font-medium text-slate-600">
              Description <span className="text-red-400">*</span>
            </Label>
            <Input
              id="qi-desc"
              placeholder="e.g. Gold Tiffany Chair rental"
              {...formik.getFieldProps("description")}
              className={`h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25 ${
                formik.touched.description && formik.errors.description ? "border-red-300" : ""
              }`}
            />
            {fieldErr("description")}
          </div>

          {/* Qty + Days + Rate */}
          <div className={`grid gap-3 ${showDays ? "grid-cols-3" : "grid-cols-2"}`}>
            <div className="space-y-1.5">
              <Label htmlFor="qi-qty" className="text-sm font-medium text-slate-600">Qty</Label>
              <Input
                id="qi-qty"
                type="number"
                min={1}
                {...formik.getFieldProps("quantity")}
                className={`h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25 ${
                  formik.touched.quantity && formik.errors.quantity ? "border-red-300" : ""
                }`}
              />
              {fieldErr("quantity")}
            </div>

            {showDays && (
              <div className="space-y-1.5">
                <Label htmlFor="qi-days" className="text-sm font-medium text-slate-600">Days</Label>
                <Input
                  id="qi-days"
                  type="number"
                  min={1}
                  {...formik.getFieldProps("days")}
                  className={`h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25 ${
                    formik.touched.days && formik.errors.days ? "border-red-300" : ""
                  }`}
                />
                {fieldErr("days")}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="qi-rate" className="text-sm font-medium text-slate-600">
                Rate <span className="text-slate-400 font-normal text-xs">(KES)</span>
              </Label>
              <Input
                id="qi-rate"
                type="number"
                min={0}
                {...formik.getFieldProps("rate")}
                className={`h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25 ${
                  formik.touched.rate && formik.errors.rate ? "border-red-300" : ""
                }`}
              />
              {fieldErr("rate")}
            </div>
          </div>

          {/* Item discount (ADMIN only) */}
          {role === "ADMIN" && (
            <div className="space-y-1.5">
              <Label htmlFor="qi-disc" className="text-sm font-medium text-slate-600">
                Item discount <span className="text-slate-400 font-normal text-xs">(KES)</span>
              </Label>
              <Input
                id="qi-disc"
                type="number"
                min={0}
                {...formik.getFieldProps("discountAmount")}
                className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
              />
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={handleClose}
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
                <><Loader2 className="h-4 w-4 animate-spin" /> Adding…</>
              ) : (
                "Add item"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
