"use client";

import { useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setAddAssetDialog } from "@/lib/store/slices/uiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { createAsset } from "@/actions/assets";
import { toast } from "sonner";
import { ImageIcon, X, Loader2, Plus } from "lucide-react";
import type { Category } from "@/types";

const schema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").required("Name is required"),
  sku: Yup.string(),
  categoryId: Yup.string().required("Select a category"),
  totalStock: Yup.number()
    .integer("Must be a whole number")
    .min(1, "At least 1")
    .required("Required"),
  baseRentalRate: Yup.number()
    .integer("Must be a whole number")
    .min(0, "Cannot be negative")
    .required("Required"),
});

function flattenCategories(cats: Category[]): { id: string; label: string; isParent: boolean }[] {
  const result: { id: string; label: string; isParent: boolean }[] = [];
  for (const cat of cats) {
    result.push({ id: cat.id, label: cat.name, isParent: true });
    for (const sub of cat.subCategories) {
      result.push({ id: sub.id, label: `${cat.name} › ${sub.name}`, isParent: false });
    }
  }
  return result;
}

interface ImagePreview {
  file: File;
  url: string;
}

export default function AddAssetDialog({ categories }: { categories: Category[] }) {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.addAssetDialog);
  const flat = flattenCategories(categories);

  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newPreviews: ImagePreview[] = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    // Reset input so same file can be re-added after removal
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleClose() {
    formik.resetForm();
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    dispatch(setAddAssetDialog(false));
  }

  const formik = useFormik({
    initialValues: { name: "", sku: "", categoryId: "", totalStock: 1, baseRentalRate: 0 },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      const fd = new FormData();
      fd.append("name", values.name);
      fd.append("categoryId", values.categoryId);
      fd.append("totalStock", String(values.totalStock));
      fd.append("baseRentalRate", String(values.baseRentalRate));
      if (values.sku.trim()) fd.append("sku", values.sku.trim());
      previews.forEach((p) => fd.append("images", p.file));

      try {
        await createAsset(fd);
        toast.success("Asset created successfully");
        helpers.resetForm();
        previews.forEach((p) => URL.revokeObjectURL(p.url));
        setPreviews([]);
        dispatch(setAddAssetDialog(false));
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create asset");
      }
    },
  });

  const fieldErr = (field: keyof typeof formik.errors) =>
    formik.touched[field] && formik.errors[field] ? (
      <p className="text-xs text-red-500 mt-1">{formik.errors[field]}</p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200 rounded-3xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-bold">New Asset</DialogTitle>
            <p className="text-sm text-slate-400 mt-0.5">
              Register a new item in your rental inventory.
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">

          {/* Image upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-600">
              Photos <span className="text-slate-400 font-normal">(optional)</span>
            </Label>

            {previews.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {previews.map((p, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 group/img shrink-0">
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
                <label className="h-20 w-20 rounded-xl border-2 border-dashed border-brand/25 flex flex-col items-center justify-center cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-all gap-1 shrink-0">
                  <ImageIcon className="h-5 w-5 text-slate-300" />
                  <span className="text-[10px] text-slate-400">Add more</span>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={handleImageChange} />
                </label>
              </div>
            ) : (
              <label className="w-full rounded-xl border-2 border-dashed border-brand/25 flex flex-col items-center justify-center cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-all gap-1.5 py-6">
                <ImageIcon className="h-7 w-7 text-slate-300" />
                <span className="text-sm text-slate-400">Click to add photos</span>
                <span className="text-xs text-slate-300">PNG, JPG, WEBP</span>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={handleImageChange} />
              </label>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="asset-name" className="text-sm font-medium text-slate-600">Asset name</Label>
            <Input
              id="asset-name"
              placeholder="e.g. Gold Tiffany Chair"
              {...formik.getFieldProps("name")}
              aria-invalid={!!(formik.touched.name && formik.errors.name)}
              className="h-auto py-2.5 px-3.5 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
            {fieldErr("name")}
          </div>

          {/* SKU */}
          <div className="space-y-1.5">
            <Label htmlFor="asset-sku" className="text-sm font-medium text-slate-600">
              SKU <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="asset-sku"
              placeholder="e.g. CHR-GOLD-001"
              {...formik.getFieldProps("sku")}
              className="h-auto py-2.5 px-3.5 rounded-xl border-slate-200 font-mono text-sm focus-visible:border-brand focus-visible:ring-brand/25"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">Category</Label>
            <Select
              value={formik.values.categoryId}
              onValueChange={(v) => formik.setFieldValue("categoryId", v)}
            >
              <SelectTrigger
                className={`w-full rounded-xl h-10 border-slate-200 ${
                  formik.touched.categoryId && formik.errors.categoryId ? "border-red-400" : ""
                }`}
              >
                <span className={`flex-1 text-left truncate text-sm ${!formik.values.categoryId ? "text-muted-foreground" : ""}`}>
                  {flat.find((c) => c.id === formik.values.categoryId)?.label ?? "Select a category…"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {flat.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className={c.isParent ? "font-medium" : "pl-1 text-slate-500"}>
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErr("categoryId")}
          </div>

          {/* Stock + Rate row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="total-stock" className="text-sm font-medium text-slate-600">Total stock</Label>
              <Input
                id="total-stock"
                type="number"
                min={1}
                step={1}
                {...formik.getFieldProps("totalStock")}
                className="h-auto py-2.5 px-3.5 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
              />
              {fieldErr("totalStock")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate" className="text-sm font-medium text-slate-600">
                Rental rate <span className="text-slate-400 font-normal text-xs">(KES/day)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none select-none">
                  KES
                </span>
                <Input
                  id="rate"
                  type="number"
                  min={0}
                  step={1}
                  {...formik.getFieldProps("baseRentalRate")}
                  className="h-auto py-2.5 pl-11 pr-3.5 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
                />
              </div>
              {fieldErr("baseRentalRate")}
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
              disabled={formik.isSubmitting}
              className="flex-1 rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/30 disabled:opacity-60 gap-1.5"
            >
              {formik.isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
              ) : (
                <><Plus className="h-4 w-4" /> Create Asset</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
