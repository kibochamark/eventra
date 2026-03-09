"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

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

  const fieldClass = (touched: boolean | undefined, error: string | undefined) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm bg-transparent text-foreground outline-none transition-colors ${
      touched && error
        ? "border-red-400 focus:border-red-500"
        : "border-foreground border-opacity-20 focus:border-foreground focus:border-opacity-50"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-sm text-foreground opacity-60">Sign in to your Eventra account</p>
        </div>

        {/* Card */}
        <div className="bg-foreground bg-opacity-5 border border-foreground border-opacity-10 rounded-2xl p-8 shadow-sm">
          {/* Server error */}
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground opacity-80 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...formik.getFieldProps("email")}
                className={fieldClass(formik.touched.email, formik.errors.email)}
                placeholder="you@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground opacity-80">
                  Password
                </label>
                <a href="#" className="text-xs text-foreground opacity-50 hover:opacity-80 transition-opacity">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...formik.getFieldProps("password")}
                className={fieldClass(formik.touched.password, formik.errors.password)}
                placeholder="••••••••"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{formik.errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="rememberMe"
                type="checkbox"
                {...formik.getFieldProps("rememberMe")}
                checked={formik.values.rememberMe}
                className="h-4 w-4 rounded border-foreground border-opacity-30 accent-foreground cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-foreground opacity-70 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-opacity
                bg-foreground text-background
                disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85 mt-1"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-foreground opacity-60 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium opacity-100 underline underline-offset-2 hover:opacity-80 transition-opacity">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
