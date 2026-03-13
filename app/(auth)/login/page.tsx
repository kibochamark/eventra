"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, CalendarDays, Users, FileText } from "lucide-react";

const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  rememberMe: Yup.boolean(),
});

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setServerError(null);
      setIsLoading(true);

      const { error } = await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: "/",
          rememberMe: values.rememberMe,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            setIsLoading(false);
          },
          onError: (ctx) => {
            setIsLoading(false);
            setServerError(ctx.error.message);
          },
        }
      );

      if (error) {
        setServerError(error.message ?? "Something went wrong. Please try again.");
        setIsLoading(false);
      }
    },
  });

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
              Manage events<br />with ease.
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
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-white/80 hover:text-white transition-colors underline underline-offset-2">
            Get started
          </Link>
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center min-h-screen lg:min-h-0 px-6 py-12 lg:bg-white relative z-10">
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
              <h1 className="text-2xl font-bold text-slate-900 mb-1.5">Welcome back</h1>
              <p className="font-serif italic text-slate-500 text-[15px]">Sign in to your RubiEvents account</p>
            </div>

            {/* Server error */}
            {serverError && (
              <div
                role="alert"
                className="mb-5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                {serverError}
              </div>
            )}

            <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-label="Email address"
                  placeholder="you@example.com"
                  aria-invalid={!!(formik.touched.email && formik.errors.email)}
                  {...formik.getFieldProps("email")}
                  className="h-auto py-3 px-4 rounded-2xl border-brand/25 bg-white/70 focus-visible:border-brand focus-visible:ring-brand/25"
                />
                {formik.touched.email && formik.errors.email && (
                  <p role="alert" className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-brand hover:text-brand/80 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-label="Password"
                  placeholder="••••••••"
                  aria-invalid={!!(formik.touched.password && formik.errors.password)}
                  {...formik.getFieldProps("password")}
                  className="h-auto py-3 px-4 rounded-2xl border-brand/25 bg-white/70 focus-visible:border-brand focus-visible:ring-brand/25"
                />
                {formik.touched.password && formik.errors.password && (
                  <p role="alert" className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...formik.getFieldProps("rememberMe")}
                  checked={formik.values.rememberMe}
                  className="h-4 w-4 rounded border-brand/30 accent-brand cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || formik.isSubmitting}
                aria-busy={isLoading}
                className="w-full bg-linear-to-r from-brand to-brand-dark hover:from-brand/90 hover:to-brand-dark/90 text-white rounded-full py-3 px-4 font-semibold text-sm transition-all shadow-lg shadow-brand/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

            </form>
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-brand hover:text-brand/80 transition-colors">
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
