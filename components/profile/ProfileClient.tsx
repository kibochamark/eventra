"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, ShieldCheck, User as UserIcon, Mail, CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateUser, resetUserPassword } from "@/actions/users";
import type { User, UserRole } from "@/types";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const infoSchema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const passwordSchema = Yup.object({
  newPassword: Yup.string().min(8, "Minimum 8 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Required"),
});

function InfoForm({ user }: { user: User }) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { name: user.name, email: user.email },
    validationSchema: infoSchema,
    onSubmit: async (values) => {
      try {
        await updateUser(user.id, { name: values.name, email: values.email });
        toast.success("Profile updated");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update profile";
        if (msg.toLowerCase().includes("email")) {
          formik.setFieldError("email", "Email already in use");
        } else {
          toast.error(msg);
        }
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="p-name" className="text-slate-600 text-sm font-medium">
          Full name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="p-name"
          {...formik.getFieldProps("name")}
          className={`rounded-xl border-slate-200 ${formik.touched.name && formik.errors.name ? "border-red-400" : ""}`}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="text-xs text-red-500">{formik.errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="p-email" className="text-slate-600 text-sm font-medium">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="p-email"
          type="email"
          {...formik.getFieldProps("email")}
          className={`rounded-xl border-slate-200 ${formik.touched.email && formik.errors.email ? "border-red-400" : ""}`}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-xs text-red-500">{formik.errors.email}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={formik.isSubmitting || !formik.dirty}
        className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white hover:opacity-90 px-6"
      >
        {formik.isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

function PasswordForm({ userId }: { userId: string }) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await resetUserPassword(userId, values.newPassword);
        toast.success("Password updated");
        resetForm();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update password");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="p-new-pw" className="text-slate-600 text-sm font-medium">
          New password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="p-new-pw"
            type={showNew ? "text" : "password"}
            {...formik.getFieldProps("newPassword")}
            className={`rounded-xl border-slate-200 pr-10 ${formik.touched.newPassword && formik.errors.newPassword ? "border-red-400" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formik.touched.newPassword && formik.errors.newPassword && (
          <p className="text-xs text-red-500">{formik.errors.newPassword}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="p-confirm-pw" className="text-slate-600 text-sm font-medium">
          Confirm password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="p-confirm-pw"
            type={showConfirm ? "text" : "password"}
            {...formik.getFieldProps("confirmPassword")}
            className={`rounded-xl border-slate-200 pr-10 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-400" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className="text-xs text-red-500">{formik.errors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={formik.isSubmitting}
        className="rounded-full bg-linear-to-r from-brand to-brand-dark text-white hover:opacity-90 px-6"
      >
        {formik.isSubmitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export default function ProfileClient({
  user,
  role,
  currentUserId,
}: {
  user: User;
  role: UserRole;
  currentUserId: string;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero card */}
      <div className="rounded-3xl bg-linear-to-br from-brand to-brand-dark p-8 relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div aria-hidden="true" className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shrink-0">
            {getInitials(user.name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-bold text-white leading-tight">{user.name}</h2>
              {/* Role badge */}
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/15 border border-white/20 text-white">
                <ShieldCheck className="h-3 w-3" />
                {role === "ADMIN" ? "Admin" : "Staff"}
              </span>
              {/* Status badge */}
              {user.banned ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500/20 border border-red-400/30 text-red-200">
                  <XCircle className="h-3 w-3" />
                  Inactive
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-col gap-1">
              <p className="text-white/70 text-sm flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {user.email}
                {!user.emailVerified && (
                  <span className="text-amber-300 text-xs">(unverified)</span>
                )}
              </p>
              {user.createdAt && (
                <p className="text-white/40 text-xs flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  Member since {formatDate(user.createdAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit info */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <UserIcon className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">Personal information</h3>
        </div>
        <InfoForm user={user} />
      </div>

      {/* Change password */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">Change password</h3>
        </div>
        <PasswordForm userId={currentUserId} />
      </div>
    </div>
  );
}
