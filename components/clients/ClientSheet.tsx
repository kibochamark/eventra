"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { closeClientSheet } from "@/lib/store/slices/uiSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, User, X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createClient, updateClient } from "@/actions/clients";
import { toast } from "sonner";
import type { Client } from "@/types";

const schema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").required("Name is required"),
  isCorporate: Yup.boolean(),
  email: Yup.string().email("Invalid email").nullable(),
  phone: Yup.string().nullable(),
  address: Yup.string().nullable(),
  contactPerson: Yup.string().nullable(),
});

export default function ClientSheet({ clients }: { clients: Client[] }) {
  const dispatch = useAppDispatch();
  const { open, clientId } = useAppSelector((s) => s.ui.clientSheet);

  const editing = clients.find((c) => c.id === clientId) ?? null;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: editing?.name ?? "",
      isCorporate: editing?.isCorporate ?? false,
      email: editing?.email ?? "",
      phone: editing?.phone ?? "",
      address: editing?.address ?? "",
      contactPerson: editing?.contactPerson ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      const payload = {
        name: values.name,
        isCorporate: values.isCorporate,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        contactPerson: values.isCorporate ? (values.contactPerson || null) : null,
      };

      try {
        if (editing) {
          await updateClient(editing.id, payload);
          toast.success("Client updated");
        } else {
          await createClient(payload);
          toast.success("Client created");
        }
        helpers.resetForm();
        dispatch(closeClientSheet());
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save client");
      }
    },
  });

  function handleClose() {
    formik.resetForm();
    dispatch(closeClientSheet());
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent className="sm:max-w-md bg-white border-slate-200 p-0 overflow-y-auto flex flex-col">
        {/* Brand header */}
        <div className="bg-linear-to-r from-brand to-brand-dark px-6 pt-6 pb-5 shrink-0">
          <div className="flex items-start justify-between">
            <SheetHeader>
              <SheetTitle className="text-white text-lg font-semibold">
                {editing ? "Edit Client" : "New Client"}
              </SheetTitle>
              <SheetDescription className="text-white/60 text-sm mt-1">
                {editing
                  ? "Update the client's contact information."
                  : "Add a new client to your directory."}
              </SheetDescription>
            </SheetHeader>
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors mt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cl-name" className="text-slate-600 text-sm font-medium">
              Full name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cl-name"
              placeholder="Google Kenya"
              {...formik.getFieldProps("name")}
              className={`rounded-xl border-slate-200 ${
                formik.touched.name && formik.errors.name ? "border-red-400" : ""
              }`}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

          {/* Corporate toggle */}
          <div className="space-y-2">
            <Label className="text-slate-600 text-sm font-medium">Client type</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  formik.setFieldValue("isCorporate", false);
                  formik.setFieldValue("contactPerson", "");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  !formik.values.isCorporate
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                <User className="h-4 w-4" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => formik.setFieldValue("isCorporate", true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  formik.values.isCorporate
                    ? "bg-brand text-white border-brand shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Corporate
              </button>
            </div>
          </div>

          {/* Contact person — only for corporate */}
          {formik.values.isCorporate && (
            <div className="space-y-1.5">
              <Label htmlFor="cl-contact" className="text-slate-600 text-sm font-medium">
                Contact person
              </Label>
              <Input
                id="cl-contact"
                placeholder="Jane Doe"
                {...formik.getFieldProps("contactPerson")}
                className="rounded-xl border-slate-200"
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="cl-email" className="text-slate-600 text-sm font-medium">Email</Label>
            <Input
              id="cl-email"
              type="email"
              placeholder="hello@company.com"
              {...formik.getFieldProps("email")}
              className={`rounded-xl border-slate-200 ${
                formik.touched.email && formik.errors.email ? "border-red-400" : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-500">{formik.errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="cl-phone" className="text-slate-600 text-sm font-medium">Phone</Label>
            <Input
              id="cl-phone"
              placeholder="+254 700 000 000"
              {...formik.getFieldProps("phone")}
              className="rounded-xl border-slate-200"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="cl-address" className="text-slate-600 text-sm font-medium">Address</Label>
            <Textarea
              id="cl-address"
              placeholder="Westlands, Nairobi"
              rows={2}
              {...formik.getFieldProps("address")}
              className="rounded-xl border-slate-200 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex-1 rounded-full bg-linear-to-r from-brand to-brand-dark text-white hover:opacity-90"
            >
              {formik.isSubmitting ? "Saving…" : editing ? "Save changes" : "Create client"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
