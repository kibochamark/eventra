"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser } from "@/actions/users";

const schema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(8, "Min 8 characters").required("Password is required"),
  role: Yup.string().oneOf(["ADMIN", "STAFF"]).required(),
});

export default function CreateUserDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "STAFF" as "ADMIN" | "STAFF",
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        await createUser(values);
        toast.success(`${values.name} added to the team`);
        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create user";
        if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("taken") || msg.toLowerCase().includes("exists")) {
          helpers.setFieldError("email", "This email is already in use");
        } else {
          toast.error(msg);
        }
      }
    },
  });

  function handleClose() {
    formik.resetForm();
    setShowPassword(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-brand to-brand-dark px-6 pt-6 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <DialogHeader>
                <DialogTitle className="text-white text-lg font-semibold">Add Team Member</DialogTitle>
                <DialogDescription className="text-white/60 text-sm mt-1">
                  Create a new staff account. They can log in immediately.
                </DialogDescription>
              </DialogHeader>
            </div>
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors mt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cu-name" className="text-slate-600 text-sm font-medium">
              Full name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cu-name"
              placeholder="Jane Muthoni"
              {...formik.getFieldProps("name")}
              className={`rounded-xl border-slate-200 ${
                formik.touched.name && formik.errors.name ? "border-red-400" : ""
              }`}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="cu-email" className="text-slate-600 text-sm font-medium">
              Email address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cu-email"
              type="email"
              placeholder="jane@company.com"
              {...formik.getFieldProps("email")}
              className={`rounded-xl border-slate-200 ${
                formik.touched.email && formik.errors.email ? "border-red-400" : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-500">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="cu-password" className="text-slate-600 text-sm font-medium">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="cu-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                {...formik.getFieldProps("password")}
                className={`rounded-xl border-slate-200 pr-10 ${
                  formik.touched.password && formik.errors.password ? "border-red-400" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500">{formik.errors.password}</p>
            )}
          </div>

          {/* Role toggle */}
          <div className="space-y-1.5">
            <Label className="text-slate-600 text-sm font-medium">Role</Label>
            <div className="flex gap-2">
              {(["STAFF", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => formik.setFieldValue("role", r)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    formik.values.role === r
                      ? r === "ADMIN"
                        ? "bg-brand text-white border-brand shadow-sm"
                        : "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {r === "STAFF" ? "Staff" : "Admin"}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {formik.values.role === "ADMIN"
                ? "Admin can manage all users, quotes, and settings."
                : "Staff can create quotes and manage rentals."}
            </p>
          </div>

          <div className="flex gap-3 pt-1">
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
              {formik.isSubmitting ? "Creating…" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
