"use client";

import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setAddCategoryDialog } from "@/lib/store/slices/uiSlice";
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
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createCategory } from "@/actions/assets";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";
import type { Category } from "@/types";

const schema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").required("Required"),
  parentId: Yup.string(),
});

interface Props {
  categories: Category[];
  defaultParentId?: string;
  onClose?: () => void;
}

export default function AddCategoryDialog({ categories, defaultParentId, onClose }: Props) {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.addCategoryDialog);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync defaultParentId whenever the dialog opens
  useEffect(() => {
    if (open) {
      formik.setFieldValue("parentId", defaultParentId ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultParentId]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    formik.resetForm();
    clearImage();
    dispatch(setAddCategoryDialog(false));
    onClose?.();
  }

  const formik = useFormik({
    initialValues: { name: "", parentId: "" },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      const fd = new FormData();
      fd.append("name", values.name);
      if (values.parentId) fd.append("parentId", values.parentId);
      if (imageFile) fd.append("image", imageFile);

      try {
        await createCategory(fd);
        toast.success("Category created");
        helpers.resetForm();
        clearImage();
        dispatch(setAddCategoryDialog(false));
        onClose?.();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create category");
      }
    },
  });

  const parentLabel = defaultParentId
    ? categories.find((c) => c.id === defaultParentId)?.name
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-sm bg-white border-slate-200 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg font-semibold">
            {parentLabel ? `New Subcategory under "${parentLabel}"` : "New Asset Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} noValidate className="mt-1 space-y-4">

          {/* Image upload */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">
              Image <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            {imagePreview ? (
              <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-slate-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-brand/25 rounded-2xl cursor-pointer hover:border-brand/50 hover:bg-brand/3 transition-all">
                <ImageIcon className="h-7 w-7 text-slate-300 mb-1.5" />
                <span className="text-xs text-slate-400">Click to upload an image</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name" className="text-sm font-medium text-slate-600">Name</Label>
            <Input
              id="cat-name"
              placeholder={parentLabel ? `e.g. Gold ${parentLabel}` : "e.g. Chairs"}
              {...formik.getFieldProps("name")}
              aria-invalid={!!(formik.touched.name && formik.errors.name)}
              className="h-auto py-2.5 px-3.5 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

          {/* Parent category — hidden when pre-set via "Add subcategory" shortcut */}
          {!defaultParentId && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">
                Parent category <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Select
                value={formik.values.parentId}
                onValueChange={(v) => formik.setFieldValue("parentId", v === "__none__" ? "" : v)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-10">
                  <SelectValue placeholder="None — create as top-level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None — create as top-level</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex-1 rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/30 disabled:opacity-60"
            >
              {formik.isSubmitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
