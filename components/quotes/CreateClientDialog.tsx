"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createClient } from "@/actions/clients";
import { toast } from "sonner";
import { Loader2, Building2, User } from "lucide-react";
import type { Client } from "@/types";

const schema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").required("Name is required"),
  isCorporate: Yup.boolean(),
  email: Yup.string().email("Invalid email"),
  phone: Yup.string(),
  address: Yup.string(),
  contactPerson: Yup.string(),
});

interface Props {
  open: boolean;
  initialName?: string;
  onClose: () => void;
  onCreated: (client: Client) => void;
}

export default function CreateClientDialog({ open, initialName = "", onClose, onCreated }: Props) {
  const formik = useFormik({
    initialValues: {
      name: initialName,
      isCorporate: false,
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        const client = await createClient({
          name: values.name,
          isCorporate: values.isCorporate,
          email: values.email || undefined,
          phone: values.phone || undefined,
          address: values.address || undefined,
          contactPerson: values.contactPerson || undefined,
        });
        toast.success(`Client "${client.name}" created`);
        helpers.resetForm();
        onCreated(client);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create client");
      }
    },
  });

  function handleClose() {
    formik.resetForm();
    onClose();
  }

  const fieldErr = (field: keyof typeof formik.errors) =>
    formik.touched[field] && formik.errors[field] ? (
      <p className="text-xs text-red-500 mt-1">{formik.errors[field]}</p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-bold">New Client</DialogTitle>
            <p className="text-sm text-slate-400 mt-0.5">
              Create a new client to link to this quote.
            </p>
          </DialogHeader>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cc-name" className="text-sm font-medium text-slate-600">
              Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="cc-name"
              placeholder="e.g. Nairobi Weddings Ltd"
              {...formik.getFieldProps("name")}
              className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
            {fieldErr("name")}
          </div>

          {/* Type toggle */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-600">Client type</Label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              <button
                type="button"
                onClick={() => formik.setFieldValue("isCorporate", false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                  !formik.values.isCorporate
                    ? "bg-brand text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <User className="h-4 w-4" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => formik.setFieldValue("isCorporate", true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                  formik.values.isCorporate
                    ? "bg-brand text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Corporate
              </button>
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cc-email" className="text-sm font-medium text-slate-600">Email</Label>
              <Input
                id="cc-email"
                type="email"
                placeholder="hello@company.com"
                {...formik.getFieldProps("email")}
                className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
              />
              {fieldErr("email")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc-phone" className="text-sm font-medium text-slate-600">Phone</Label>
              <Input
                id="cc-phone"
                type="tel"
                placeholder="+254 7xx xxx xxx"
                {...formik.getFieldProps("phone")}
                className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="cc-address" className="text-sm font-medium text-slate-600">Address</Label>
            <Input
              id="cc-address"
              placeholder="Street, City"
              {...formik.getFieldProps("address")}
              className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
            />
          </div>

          {/* Contact person (corporate only) */}
          {formik.values.isCorporate && (
            <div className="space-y-1.5">
              <Label htmlFor="cc-contact" className="text-sm font-medium text-slate-600">
                Contact person
              </Label>
              <Input
                id="cc-contact"
                placeholder="Primary contact name"
                {...formik.getFieldProps("contactPerson")}
                className="h-10 rounded-xl border-slate-200 focus-visible:border-brand focus-visible:ring-brand/25"
              />
            </div>
          )}

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
                "Create Client"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
