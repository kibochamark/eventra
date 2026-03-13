"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Eye, EyeOff, Building2, User, Loader2, CalendarDays, Users, FileText } from "lucide-react";
import { toast } from "sonner";

const onboardingSchema = Yup.object({
  companyName: Yup.string().min(2, "At least 2 characters").required("Required"),
  isVatRegistered: Yup.boolean(),
  vatPercentage: Yup.number().when("isVatRegistered", {
    is: true,
    then: (s) => s.min(0).max(100).required("Required"),
    otherwise: (s) => s.optional(),
  }),
  name: Yup.string().min(2, "At least 2 characters").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Min. 8 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Required"),
});

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      companyName: "",
      isVatRegistered: false,
      vatPercentage: 16,
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: onboardingSchema,
    onSubmit: async (values) => {
      try {
        const res = await fetch("/api/onboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: values.companyName,
            isVatRegistered: values.isVatRegistered,
            vatPercentage: values.isVatRegistered ? values.vatPercentage : undefined,
            name: values.name,
            email: values.email,
            password: values.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error ?? "Something went wrong");
          return;
        }

        toast.success("Workspace created! Signing you in…");
        router.push("/");
      } catch {
        toast.error("A network error occurred. Please try again.");
      }
    },
  });

  const err = (field: keyof typeof formik.errors) =>
    formik.touched[field] && formik.errors[field] ? (
      <p role="alert" className="text-xs text-red-500 mt-1">{String(formik.errors[field])}</p>
    ) : null;

  const inputCls = (field: keyof typeof formik.errors) =>
    `h-auto py-3 px-4 rounded-2xl border-brand/25 bg-white/70 focus-visible:border-brand focus-visible:ring-brand/25 ${
      formik.touched[field] && formik.errors[field] ? "border-red-300" : ""
    }`;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[55fr_45fr] bg-linear-to-br from-brand-muted via-white to-brand-muted lg:bg-none">

      {/* Decorative blurred circles — mobile only */}
      <div aria-hidden="true" className="lg:hidden pointer-events-none">
        <div className="fixed top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-brand-dark/25 blur-3xl" />
      </div>

      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-brand via-brand to-brand-dark p-12 relative overflow-hidden">

        {/* Decorative SVG blobs */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <svg className="absolute -top-24 -right-24 w-105 h-105 text-white/20" viewBox="0 0 200 200" fill="none">
            <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.2,88.5,-0.9C87,14.4,81.4,28.8,73.1,41.4C64.8,54,53.7,64.8,40.5,71.8C27.4,78.8,13.7,82,-0.8,83.3C-15.4,84.6,-30.7,83.9,-43.8,77.2C-56.8,70.4,-67.5,57.5,-74.2,42.9C-80.9,28.2,-83.6,11.9,-81.8,-3.8C-80,-19.5,-73.8,-34.7,-64.2,-47.1C-54.6,-59.5,-41.7,-69.1,-27.9,-76.2C-14,-83.3,-0.3,-87.9,14.1,-86.2C28.6,-84.5,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" fill="currentColor" />
          </svg>
          <svg className="absolute -bottom-16 -left-16 w-72 h-72 text-white/10" viewBox="0 0 200 200" fill="none">
            <path d="M47.7,-73.8C62.3,-67.3,75,-55.5,81.8,-41C88.5,-26.5,89.3,-9.3,85.8,6.2C82.3,21.7,74.6,35.5,64.3,46.9C54,58.4,41.1,67.5,26.7,73.4C12.3,79.3,-3.7,82,-18.4,79.1C-33.1,76.2,-46.6,67.6,-57.8,56C-69.1,44.4,-78.1,29.8,-81.6,13.5C-85.1,-2.8,-83.1,-20.8,-75.6,-35.5C-68.1,-50.2,-55,-61.5,-40.4,-68C-25.9,-74.5,-9.8,-76.2,3.9,-81.8C17.5,-87.4,33.1,-80.3,47.7,-73.8Z" transform="translate(100 100)" fill="currentColor" />
          </svg>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">RubiEvents</span>
        </div>

        {/* Hero content */}
        <div className="space-y-8 relative z-10">
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Premium Event Management</p>
            <h2 className="text-5xl font-bold text-white leading-[1.1] mb-5">
              Everything your<br />team needs.
            </h2>
            <p className="font-serif italic text-xl text-white/75 leading-relaxed">
              &ldquo;Where moments become memories&rdquo;
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { Icon: CalendarDays, label: "Events" },
              { Icon: Users, label: "Clients" },
              { Icon: FileText, label: "Quotes" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2"
              >
                <Icon className="h-3.5 w-3.5 text-white/70" />
                <span className="text-sm font-medium text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-white/40 relative z-10">
          Already have an account?{" "}
          <Link href="/login" className="text-white/80 hover:text-white transition-colors underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-start justify-center min-h-screen lg:min-h-0 px-6 py-12 lg:bg-white relative z-10 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-xl bg-brand/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <span className="text-lg font-bold text-slate-900">RubiEvents</span>
          </div>

          {/* Glass card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-brand/15 p-8 lg:p-10">

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Set up your workspace</h1>
              <p className="font-serif italic text-slate-500 text-[15px]">One-time setup — takes less than a minute</p>
            </div>

            <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">

              {/* ── Company section ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <Building2 className="h-3.5 w-3.5" />
                  Company
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                    Company name
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Events Ltd."
                    autoComplete="organization"
                    {...formik.getFieldProps("companyName")}
                    className={inputCls("companyName")}
                  />
                  {err("companyName")}
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    id="isVatRegistered"
                    type="checkbox"
                    {...formik.getFieldProps("isVatRegistered")}
                    checked={formik.values.isVatRegistered}
                    className="h-4 w-4 rounded border-brand/30 accent-brand cursor-pointer"
                  />
                  <Label htmlFor="isVatRegistered" className="font-normal cursor-pointer text-sm text-slate-600 select-none">
                    VAT registered
                  </Label>
                </div>

                {formik.values.isVatRegistered && (
                  <div className="space-y-1.5">
                    <Label htmlFor="vatPercentage" className="text-sm font-medium text-slate-700">
                      VAT percentage <span className="font-normal text-slate-400">(%)</span>
                    </Label>
                    <Input
                      id="vatPercentage"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      placeholder="16"
                      {...formik.getFieldProps("vatPercentage")}
                      className={inputCls("vatPercentage")}
                    />
                    {err("vatPercentage")}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100" />

              {/* ── Admin account ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <User className="h-3.5 w-3.5" />
                  Admin account
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full name</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    {...formik.getFieldProps("name")}
                    className={inputCls("name")}
                  />
                  {err("name")}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@company.com"
                    {...formik.getFieldProps("email")}
                    className={inputCls("email")}
                  />
                  {err("email")}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      {...formik.getFieldProps("password")}
                      className={`pr-10 ${inputCls("password")}`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {err("password")}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...formik.getFieldProps("confirmPassword")}
                      className={`pr-10 ${inputCls("confirmPassword")}`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {err("confirmPassword")}
                </div>
              </div>

              <Button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-linear-to-r from-brand to-brand-dark hover:from-brand/90 hover:to-brand-dark/90 text-white rounded-full py-3 font-semibold text-sm shadow-lg shadow-brand/30 disabled:opacity-60 gap-2 mt-1"
              >
                {formik.isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating workspace…</>
                ) : (
                  "Create workspace"
                )}
              </Button>

            </form>
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand hover:text-brand/80 transition-colors">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
