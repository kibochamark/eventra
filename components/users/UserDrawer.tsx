"use client";

import { useState } from "react";
import { Eye, EyeOff, ChevronRight, Shield, ShieldOff, Trash2, KeyRound } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
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
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { closeUserDrawer } from "@/lib/store/slices/uiSlice";
import {
  updateUser,
  changeUserRole,
  resetUserPassword,
  deactivateUser,
  activateUser,
  deleteUser,
} from "@/actions/users";
import type { User, UserRole } from "@/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Edit info form ──────────────────────────────────────────────────────────

const editSchema = Yup.object({
  name: Yup.string().min(2, "At least 2 characters").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
});

function EditInfoForm({ user, canEdit }: { user: User; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { name: user.name, email: user.email },
    validationSchema: editSchema,
    onSubmit: async (values, helpers) => {
      try {
        await updateUser(user.id, values);
        toast.success("Profile updated");
        setEditing(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Update failed";
        if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("taken")) {
          helpers.setFieldError("email", "This email is already in use");
        } else {
          toast.error(msg);
        }
      }
    },
  });

  if (!editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Contact Info</h3>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-brand hover:text-brand/80 font-medium transition-colors"
            >
              Edit
            </button>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Name</p>
            <p className="text-slate-800 font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Email</p>
            <p className="text-slate-800">{user.email}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">Edit Contact Info</h3>
      <div className="space-y-1.5">
        <Label htmlFor="ud-name" className="text-slate-500 text-xs">Name</Label>
        <Input
          id="ud-name"
          {...formik.getFieldProps("name")}
          className={`h-9 text-sm rounded-xl border-slate-200 ${formik.touched.name && formik.errors.name ? "border-red-400" : ""}`}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="text-xs text-red-500">{formik.errors.name}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ud-email" className="text-slate-500 text-xs">Email</Label>
        <Input
          id="ud-email"
          type="email"
          {...formik.getFieldProps("email")}
          className={`h-9 text-sm rounded-xl border-slate-200 ${formik.touched.email && formik.errors.email ? "border-red-400" : ""}`}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-xs text-red-500">{formik.errors.email}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => { formik.resetForm(); setEditing(false); }}
          className="flex-1 rounded-full text-xs border-slate-200"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={formik.isSubmitting}
          className="flex-1 rounded-full bg-linear-to-r from-brand to-brand-dark text-white text-xs hover:opacity-90"
        >
          {formik.isSubmitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

// ── Change role section ─────────────────────────────────────────────────────

function ChangeRoleSection({ user }: { user: User }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const targetRole: UserRole = user.role === "ADMIN" ? "STAFF" : "ADMIN";

  async function handleConfirm() {
    setLoading(true);
    try {
      await changeUserRole(user.id, targetRole);
      toast.success(`Role changed to ${targetRole === "ADMIN" ? "Admin" : "Staff"}`);
      setConfirming(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-700">Role</h3>
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
            user.role === "ADMIN"
              ? "bg-brand/10 text-brand border-brand/20"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {user.role === "ADMIN" ? "Admin" : "Staff"}
        </span>
        {!confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
          >
            Change to {targetRole === "ADMIN" ? "Admin" : "Staff"}
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {confirming && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <p className="text-xs text-amber-800">
            {targetRole === "ADMIN"
              ? `Promote ${user.name} to Admin? This grants full system access.`
              : `Demote ${user.name} to Staff? They will lose admin privileges.`}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-full text-xs border-amber-300 text-amber-700 hover:bg-amber-50 h-7"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={loading}
              onClick={handleConfirm}
              className="flex-1 rounded-full text-xs h-7 bg-amber-600 text-white hover:bg-amber-700"
            >
              {loading ? "Changing…" : "Confirm"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reset password section ──────────────────────────────────────────────────

const pwSchema = Yup.object({
  newPassword: Yup.string().min(8, "Min 8 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Required"),
});

function ResetPasswordSection({ user }: { user: User }) {
  const [expanded, setExpanded] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: pwSchema,
    onSubmit: async (values, helpers) => {
      try {
        await resetUserPassword(user.id, values.newPassword);
        toast.success(`Password reset for ${user.name}`);
        helpers.resetForm();
        setExpanded(false);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to reset password");
      }
    },
  });

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between text-sm text-slate-600 hover:text-brand py-2 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-slate-400 group-hover:text-brand transition-colors" />
          <span>Reset Password</span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand transition-colors" />
      </button>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-brand" />
          Reset Password
        </h3>
        <button
          type="button"
          onClick={() => { formik.resetForm(); setExpanded(false); }}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ud-newpw" className="text-xs text-slate-500">New password</Label>
        <div className="relative">
          <Input
            id="ud-newpw"
            type={showNew ? "text" : "password"}
            placeholder="Min 8 characters"
            {...formik.getFieldProps("newPassword")}
            className={`h-9 text-sm pr-9 rounded-xl border-slate-200 ${formik.touched.newPassword && formik.errors.newPassword ? "border-red-400" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowNew((p) => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        {formik.touched.newPassword && formik.errors.newPassword && (
          <p className="text-xs text-red-500">{formik.errors.newPassword}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ud-confirmpw" className="text-xs text-slate-500">Confirm password</Label>
        <div className="relative">
          <Input
            id="ud-confirmpw"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat password"
            {...formik.getFieldProps("confirmPassword")}
            className={`h-9 text-sm pr-9 rounded-xl border-slate-200 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-400" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className="text-xs text-red-500">{formik.errors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={formik.isSubmitting}
        className="w-full rounded-full bg-linear-to-r from-brand to-brand-dark text-white text-xs hover:opacity-90"
      >
        {formik.isSubmitting ? "Setting…" : "Set Password"}
      </Button>
    </form>
  );
}

// ── Main drawer ─────────────────────────────────────────────────────────────

export default function UserDrawer({ users }: { users: User[] }) {
  const dispatch = useAppDispatch();
  const { open, userId } = useAppSelector((s) => s.ui.userDrawer);
  const sessionRole = useAppSelector((s) => s.session.role);
  const sessionUserId = useAppSelector((s) => s.session.userId);

  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const user = users.find((u) => u.id === userId) ?? null;

  const isAdmin = sessionRole === "ADMIN";
  const isOwnAccount = user?.id === sessionUserId;
  const canEdit = isAdmin || isOwnAccount;

  function handleClose() {
    setDeactivateConfirm(false);
    setDeleteConfirm(false);
    dispatch(closeUserDrawer());
  }

  async function handleDeactivate() {
    if (!user) return;
    setActionLoading(true);
    try {
      await deactivateUser(user.id);
      toast.success(`${user.name} has been deactivated`);
      setDeactivateConfirm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleActivate() {
    if (!user) return;
    setActionLoading(true);
    try {
      await activateUser(user.id);
      toast.success(`${user.name} has been activated`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to activate");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    setActionLoading(true);
    try {
      await deleteUser(user.id);
      toast.success(`${user.name} has been deleted`);
      handleClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent className="sm:max-w-md bg-white border-slate-200 p-0 overflow-y-auto flex flex-col">
        {user ? (
          <>
            {/* Profile header */}
            <div className="bg-linear-to-br from-brand to-brand-dark px-6 pt-6 pb-5 shrink-0">
              <SheetHeader className="sr-only">
                <SheetTitle>{user.name}</SheetTitle>
                <SheetDescription>User profile and management actions</SheetDescription>
              </SheetHeader>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="text-white font-semibold text-lg leading-tight truncate">
                    {user.name}
                  </h2>
                  <p className="text-white/60 text-sm mt-0.5 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Staff"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.banned
                          ? "bg-red-500/30 text-red-100"
                          : "bg-emerald-500/30 text-emerald-100"
                      }`}
                    >
                      <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          user.banned ? "bg-red-300" : "bg-emerald-300"
                        }`}
                      />
                      {user.banned ? "Inactive" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-white/40 text-xs mt-3">
                Joined {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Body sections */}
            <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">
              {/* Edit info */}
              <section>
                <EditInfoForm user={user} canEdit={canEdit} />
              </section>

              {/* Change role — ADMIN only, not own account */}
              {isAdmin && !isOwnAccount && (
                <>
                  <hr className="border-slate-100" />
                  <section>
                    <ChangeRoleSection user={user} />
                  </section>
                </>
              )}

              {/* Reset password — ADMIN only */}
              {isAdmin && (
                <>
                  <hr className="border-slate-100" />
                  <section>
                    <ResetPasswordSection user={user} />
                  </section>
                </>
              )}

              {/* Activate / Deactivate — ADMIN only, not own account */}
              {isAdmin && !isOwnAccount && (
                <>
                  <hr className="border-slate-100" />
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-700">Account Status</h3>
                    {user.banned ? (
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={handleActivate}
                        className="w-full rounded-full bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        {actionLoading ? "Activating…" : "Activate Account"}
                      </Button>
                    ) : (
                      <>
                        {!deactivateConfirm ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading}
                            onClick={() => setDeactivateConfirm(true)}
                            className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 gap-2"
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                            Deactivate Account
                          </Button>
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                            <p className="text-xs text-red-700">
                              Deactivating {user.name} will prevent them from logging in. Continue?
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeactivateConfirm(false)}
                                className="flex-1 rounded-full text-xs border-red-200 text-red-600 hover:bg-red-50 h-7"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                disabled={actionLoading}
                                onClick={handleDeactivate}
                                className="flex-1 rounded-full text-xs h-7 bg-red-600 text-white hover:bg-red-700"
                              >
                                {actionLoading ? "Deactivating…" : "Deactivate"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                </>
              )}

              {/* Delete — ADMIN only, not own account */}
              {isAdmin && !isOwnAccount && (
                <>
                  <hr className="border-slate-100" />
                  <section className="space-y-2 pb-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Danger Zone
                    </h3>
                    {!deleteConfirm ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(true)}
                        className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 gap-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete User
                      </Button>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                        <p className="text-xs text-red-700 font-medium">
                          Permanently delete {user.name}? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirm(false)}
                            className="flex-1 rounded-full text-xs border-red-200 text-red-600 hover:bg-red-50 h-7"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            disabled={actionLoading}
                            onClick={handleDelete}
                            className="flex-1 rounded-full text-xs h-7 bg-red-600 text-white hover:bg-red-700"
                          >
                            {actionLoading ? "Deleting…" : "Delete"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
            <SheetHeader className="sr-only">
              <SheetTitle>User</SheetTitle>
              <SheetDescription>Loading user details</SheetDescription>
            </SheetHeader>
            Loading…
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
