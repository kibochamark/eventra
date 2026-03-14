"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Building2, User, X, Trash2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateClient, deleteClient } from "@/actions/clients";
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

export default function EditClientDrawer({
  client,
  open,
  onClose,
}: {
  client: Client;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: client.name,
      isCorporate: client.isCorporate,
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      contactPerson: client.contactPerson ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const payload = {
        name: values.name,
        isCorporate: values.isCorporate,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        contactPerson: values.isCorporate ? (values.contactPerson || null) : null,
      };
      try {
        await updateClient(client.id, payload);
        toast.success("Client updated");
        onClose();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update client");
      }
    },
  });

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteClient(client.id);
      toast.success(`${client.name} deleted`);
      onClose();
      router.push("/dashboard/clients");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      if (msg.toLowerCase().includes("quotes") || msg.toLowerCase().includes("existing")) {
        toast.error("This client has existing quotes and cannot be deleted. Update their details instead.");
      } else {
        toast.error(msg);
      }
      setDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="sm:max-w-md bg-white border-slate-200 p-0 overflow-y-auto flex flex-col">
        {/* Brand header */}
        <div className="bg-linear-to-r from-brand to-brand-dark px-6 pt-6 pb-5 shrink-0">
          <div className="flex items-start justify-between">
            <SheetHeader>
              <SheetTitle className="text-white text-lg font-semibold">Edit Client</SheetTitle>
              <SheetDescription className="text-white/60 text-sm mt-1">
                Update contact details for {client.name}.
              </SheetDescription>
            </SheetHeader>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors mt-0.5">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="ec-name" className="text-slate-600 text-sm font-medium">
              Full name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ec-name"
              {...formik.getFieldProps("name")}
              className={`rounded-xl border-slate-200 ${formik.touched.name && formik.errors.name ? "border-red-400" : ""}`}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

          {/* Type toggle */}
          <div className="space-y-2">
            <Label className="text-slate-600 text-sm font-medium">Client type</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { formik.setFieldValue("isCorporate", false); formik.setFieldValue("contactPerson", ""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  !formik.values.isCorporate
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                <User className="h-4 w-4" />Individual
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
                <Building2 className="h-4 w-4" />Corporate
              </button>
            </div>
          </div>

          {formik.values.isCorporate && (
            <div className="space-y-1.5">
              <Label htmlFor="ec-contact" className="text-slate-600 text-sm font-medium">Contact person</Label>
              <Input id="ec-contact" placeholder="Jane Doe" {...formik.getFieldProps("contactPerson")} className="rounded-xl border-slate-200" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="ec-email" className="text-slate-600 text-sm font-medium">Email</Label>
            <Input
              id="ec-email"
              type="email"
              {...formik.getFieldProps("email")}
              className={`rounded-xl border-slate-200 ${formik.touched.email && formik.errors.email ? "border-red-400" : ""}`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-500">{formik.errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ec-phone" className="text-slate-600 text-sm font-medium">Phone</Label>
            <Input id="ec-phone" {...formik.getFieldProps("phone")} className="rounded-xl border-slate-200" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ec-address" className="text-slate-600 text-sm font-medium">Address</Label>
            <Textarea id="ec-address" rows={2} {...formik.getFieldProps("address")} className="rounded-xl border-slate-200 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting} className="flex-1 rounded-full bg-linear-to-r from-brand to-brand-dark text-white hover:opacity-90">
              {formik.isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>

          {/* Danger zone */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Danger Zone</p>
            {!deleteConfirm ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirm(true)}
                className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Client
              </Button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                <p className="text-xs text-red-700 font-medium">
                  Permanently delete {client.name}? This cannot be undone.
                </p>
                <p className="text-xs text-red-500">
                  Note: clients with existing quotes cannot be deleted.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(false)} className="flex-1 rounded-full text-xs border-red-200 text-red-600 hover:bg-red-50 h-7">
                    Cancel
                  </Button>
                  <Button size="sm" disabled={deleting} onClick={handleDelete} className="flex-1 rounded-full text-xs h-7 bg-red-600 text-white hover:bg-red-700">
                    {deleting ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
