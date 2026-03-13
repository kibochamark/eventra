"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { closeStockMovementSheet } from "@/lib/store/slices/uiSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import { logStockMovement } from "@/actions/assets";
import { toast } from "sonner";
import {
  Truck,
  RotateCcw,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Package,
  MapPin,
  Hammer,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import type { Asset, MovementType } from "@/types";

// ─── movement type config ─────────────────────────────────────────────────────

const MOVEMENT_TYPES: {
  type: MovementType;
  icon: React.ElementType;
  label: string;
  description: string;
  effect: string;
  accent: string;
  bg: string;
  border: string;
  selected: string;
}[] = [
  {
    type: "DISPATCH",
    icon: Truck,
    label: "Dispatch",
    description: "Send to event",
    effect: "Available → On-Site",
    accent: "text-brand",
    bg: "bg-brand/6",
    border: "border-brand/20",
    selected: "border-brand bg-brand/8 shadow-brand/20",
  },
  {
    type: "RETURN",
    icon: RotateCcw,
    label: "Return",
    description: "Back from event",
    effect: "On-Site → Available",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    selected: "border-emerald-500 bg-emerald-50 shadow-emerald-200/60",
  },
  {
    type: "REPAIR_IN",
    icon: Wrench,
    label: "Send to Repair",
    description: "Damaged item",
    effect: "Available → In-Repair",
    accent: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    selected: "border-amber-500 bg-amber-50 shadow-amber-200/60",
  },
  {
    type: "REPAIR_OUT",
    icon: CheckCircle2,
    label: "Repaired",
    description: "Fixed, returning",
    effect: "In-Repair → Available",
    accent: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    selected: "border-teal-500 bg-teal-50 shadow-teal-200/60",
  },
  {
    type: "LOSS",
    icon: AlertTriangle,
    label: "Record Loss",
    description: "Permanently lost",
    effect: "Available ↓ (permanent)",
    accent: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    selected: "border-red-500 bg-red-50 shadow-red-200/60",
  },
];

const schema = Yup.object({
  type: Yup.string<MovementType>().required("Select a movement type"),
  quantity: Yup.number()
    .integer()
    .min(1, "At least 1")
    .required("Required"),
  notes: Yup.string(),
});

interface ImagePreview {
  file: File;
  url: string;
}

export default function StockMovementSheet({ assets }: { assets: Asset[] }) {
  const dispatch = useAppDispatch();
  const { open, assetId } = useAppSelector((s) => s.ui.stockMovementSheet);

  const asset = assets.find((a) => a.id === assetId) ?? null;

  const [photos, setPhotos] = useState<ImagePreview[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    ]);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleClose() {
    formik.resetForm();
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    dispatch(closeStockMovementSheet());
  }

  const formik = useFormik({
    initialValues: { type: "" as MovementType, quantity: 1, notes: "" },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      if (!assetId) return;
      const fd = new FormData();
      fd.append("type", values.type);
      fd.append("quantity", String(values.quantity));
      if (values.notes.trim()) fd.append("notes", values.notes.trim());
      photos.forEach((p) => fd.append("images", p.file));

      try {
        await logStockMovement(assetId, fd);
        toast.success("Stock movement logged");
        helpers.resetForm();
        photos.forEach((p) => URL.revokeObjectURL(p.url));
        setPhotos([]);
        dispatch(closeStockMovementSheet());
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to log movement");
      }
    },
  });

  const selectedConfig = MOVEMENT_TYPES.find((m) => m.type === formik.values.type);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent className="sm:max-w-md bg-white border-slate-200 flex flex-col p-0 overflow-hidden">

        {/* Gradient header */}
        <div className="bg-linear-to-br from-brand to-brand-dark px-6 py-5 shrink-0">
          <SheetHeader>
            <SheetTitle className="text-white text-lg font-bold">Log Stock Movement</SheetTitle>
            <p className="text-white/65 text-sm">
              Record a dispatch, return, repair, or loss.
            </p>
          </SheetHeader>

          {/* Asset context chip */}
          {asset && (
            <div className="mt-4 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {asset.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-sm truncate">{asset.name}</p>
                <p className="text-white/60 text-xs truncate">
                  {asset.category.parent
                    ? `${asset.category.parent.name} › ${asset.category.name}`
                    : asset.category.name}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 text-xs">
                <span className="flex items-center gap-1 text-emerald-300 font-medium">
                  <Package className="h-3 w-3" />
                  {asset.unitsAvailable}
                </span>
                <span className="flex items-center gap-1 text-white/70 font-medium">
                  <MapPin className="h-3 w-3" />
                  {asset.unitsOnSite}
                </span>
                {asset.unitsInRepair > 0 && (
                  <span className="flex items-center gap-1 text-amber-300 font-medium">
                    <Hammer className="h-3 w-3" />
                    {asset.unitsInRepair}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form body */}
        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Movement type selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-600">Movement type</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MOVEMENT_TYPES.map((m) => {
                const Icon = m.icon;
                const isSelected = formik.values.type === m.type;
                return (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => formik.setFieldValue("type", m.type)}
                    className={`relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 text-left transition-all duration-150 shadow-sm ${
                      isSelected
                        ? `${m.selected} shadow-md`
                        : `${m.border} ${m.bg} hover:border-opacity-60`
                    }`}
                  >
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isSelected ? "bg-white/60" : "bg-white"}`}>
                      <Icon className={`h-4 w-4 ${m.accent}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${m.accent}`}>{m.label}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{m.description}</p>
                    </div>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-current opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Effect preview */}
            {selectedConfig && (
              <p className="text-xs text-slate-500 pl-1">
                <span className="font-medium text-slate-700">Effect:</span>{" "}
                {selectedConfig.effect}
              </p>
            )}

            {formik.touched.type && formik.errors.type && (
              <p className="text-xs text-red-500">{formik.errors.type}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label htmlFor="sm-qty" className="text-sm font-medium text-slate-600">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-xl border-slate-200 p-0 text-slate-500 hover:border-brand hover:text-brand shrink-0"
                onClick={() =>
                  formik.setFieldValue("quantity", Math.max(1, formik.values.quantity - 1))
                }
              >
                −
              </Button>
              <Input
                id="sm-qty"
                type="number"
                min={1}
                step={1}
                {...formik.getFieldProps("quantity")}
                className="text-center h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25 font-semibold text-slate-900"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-xl border-slate-200 p-0 text-slate-500 hover:border-brand hover:text-brand shrink-0"
                onClick={() =>
                  formik.setFieldValue("quantity", formik.values.quantity + 1)
                }
              >
                +
              </Button>
            </div>
            {formik.touched.quantity && formik.errors.quantity && (
              <p className="text-xs text-red-500">{formik.errors.quantity}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="sm-notes" className="text-sm font-medium text-slate-600">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="sm-notes"
              placeholder="e.g. Legs bent during the gala event setup"
              rows={3}
              {...formik.getFieldProps("notes")}
              className="rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25 resize-none"
            />
          </div>

          {/* Condition photos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-600">
              Condition photos <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 group/photo">
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ))}
              <label className="h-16 w-16 rounded-xl border-2 border-dashed border-brand/25 flex flex-col items-center justify-center cursor-pointer hover:border-brand/50 hover:bg-brand/3 transition-all gap-0.5">
                <ImageIcon className="h-4 w-4 text-slate-300" />
                <span className="text-[9px] text-slate-400">Add photo</span>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
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
              disabled={formik.isSubmitting || !formik.values.type}
              className="flex-1 rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/30 disabled:opacity-60 gap-1.5"
            >
              {formik.isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Logging…</>
              ) : (
                "Log Movement"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
