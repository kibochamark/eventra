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
import { useFormik } from "formik";
import * as Yup from "yup";
import { createClient, updateClient } from "@/actions/clients";
import { toast } from "sonner";
import type { Client } from "@/types";

const schema = Yup.object({
  name: Yup.string().min(2).required("Required"),
  isCorporate: Yup.boolean(),
  email: Yup.string().email("Invalid email"),
  phone: Yup.string(),
  address: Yup.string(),
  contactPerson: Yup.string(),
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
        contactPerson: values.contactPerson || null,
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

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) { formik.resetForm(); dispatch(closeClientSheet()); }
      }}
    >
      <SheetContent className="sm:max-w-md bg-white border-gray-200">
        <SheetHeader>
          <SheetTitle className="text-white">{editing ? "Edit Client" : "New Client"}</SheetTitle>
          <SheetDescription className="text-gray-400">
            {editing ? "Update client contact details." : "Add a new client to your database."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} noValidate className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cl-name" className="text-gray-500">Name *</Label>
            <Input
              id="cl-name"
              placeholder="Acme Events Ltd"
              {...formik.getFieldProps("name")}
              className={formik.touched.name && formik.errors.name ? "border-red-500/60" : ""}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-600">{formik.errors.name}</p>
            )}
          </div>

          {/* Corporate toggle */}
          <div className="flex items-center gap-3">
            <input
              id="cl-corporate"
              type="checkbox"
              className="h-4 w-4 rounded border-[#1e293b] accent-indigo-600"
              {...formik.getFieldProps("isCorporate")}
              checked={formik.values.isCorporate}
            />
            <Label htmlFor="cl-corporate" className="font-normal cursor-pointer text-gray-500">
              Corporate client
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cl-email" className="text-gray-500">Email</Label>
            <Input
              id="cl-email"
              type="email"
              placeholder="hello@acme.com"
              {...formik.getFieldProps("email")}
              className={formik.touched.email && formik.errors.email ? "border-red-500/60" : ""}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-600">{formik.errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cl-phone" className="text-gray-500">Phone</Label>
            <Input id="cl-phone" placeholder="+254 700 000 000" {...formik.getFieldProps("phone")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cl-contact" className="text-gray-500">Contact person</Label>
            <Input id="cl-contact" placeholder="Jane Doe" {...formik.getFieldProps("contactPerson")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cl-address" className="text-gray-500">Address</Label>
            <Textarea
              id="cl-address"
              placeholder="Westlands, Nairobi"
              rows={2}
              {...formik.getFieldProps("address")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full border-[#1e293b] text-gray-500 hover:bg-gray-50"
              onClick={() => { formik.resetForm(); dispatch(closeClientSheet()); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex-1 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800"
            >
              {formik.isSubmitting ? "Saving…" : editing ? "Save changes" : "Create client"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
