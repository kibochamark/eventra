"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const onboardingSchema = Yup.object({
  // Company
  companyName: Yup.string().min(2, "Company name must be at least 2 characters").required("Company name is required"),
  isVatRegistered: Yup.boolean(),
  vatPercentage: Yup.number().when("isVatRegistered", {
    is: true,
    then: (s) => s.min(0, "Must be ≥ 0").max(100, "Must be ≤ 100").required("VAT percentage is required"),
    otherwise: (s) => s.optional(),
  }),
  // Admin account
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function OnboardingPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setServerError(null);
      setIsLoading(true);

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
          setServerError(data.error ?? "Something went wrong. Please try again.");
          return;
        }

        // Session cookies were forwarded by the API — redirect to dashboard.
        router.push("/");
      } catch {
        setServerError("A network error occurred. Please try again.");
      } finally {
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Set up your company</h1>
          <p className="text-sm text-foreground opacity-60">
            Create your Eventra workspace — takes less than a minute
          </p>
        </div>

        {/* Card */}
        <div className="border border-foreground border-opacity-10 rounded-2xl p-8 shadow-sm">
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
            {/* ── Company information ─────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground opacity-40 mb-4">
                Company information
              </p>

              <div className="space-y-4">
                {/* Company name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-foreground opacity-80 mb-1.5">
                    Company name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    {...formik.getFieldProps("companyName")}
                    className={fieldClass(formik.touched.companyName, formik.errors.companyName)}
                    placeholder="Acme Events Ltd."
                  />
                  {formik.touched.companyName && formik.errors.companyName && (
                    <p className="mt-1.5 text-xs text-red-500">{formik.errors.companyName}</p>
                  )}
                </div>

                {/* VAT registered */}
                <div className="flex items-center gap-2.5">
                  <input
                    id="isVatRegistered"
                    type="checkbox"
                    {...formik.getFieldProps("isVatRegistered")}
                    checked={formik.values.isVatRegistered}
                    className="h-4 w-4 rounded border-foreground border-opacity-30 accent-foreground cursor-pointer"
                  />
                  <label htmlFor="isVatRegistered" className="text-sm text-foreground opacity-70 cursor-pointer select-none">
                    VAT registered
                  </label>
                </div>

                {/* VAT percentage — only shown when VAT-registered */}
                {formik.values.isVatRegistered && (
                  <div>
                    <label htmlFor="vatPercentage" className="block text-sm font-medium text-foreground opacity-80 mb-1.5">
                      VAT percentage (%)
                    </label>
                    <input
                      id="vatPercentage"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      {...formik.getFieldProps("vatPercentage")}
                      className={fieldClass(formik.touched.vatPercentage, formik.errors.vatPercentage)}
                      placeholder="16"
                    />
                    {formik.touched.vatPercentage && formik.errors.vatPercentage && (
                      <p className="mt-1.5 text-xs text-red-500">{formik.errors.vatPercentage}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-foreground border-opacity-10" />

            {/* ── Admin account ────────────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground opacity-40 mb-4">
                Admin account
              </p>

              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground opacity-80 mb-1.5">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    {...formik.getFieldProps("name")}
                    className={fieldClass(formik.touched.name, formik.errors.name)}
                    placeholder="Jane Doe"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1.5 text-xs text-red-500">{formik.errors.name}</p>
                  )}
                </div>

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
                    placeholder="jane@company.com"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">{formik.errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground opacity-80 mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...formik.getFieldProps("password")}
                    className={fieldClass(formik.touched.password, formik.errors.password)}
                    placeholder="Min. 8 characters"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="mt-1.5 text-xs text-red-500">{formik.errors.password}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground opacity-80 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...formik.getFieldProps("confirmPassword")}
                    className={fieldClass(formik.touched.confirmPassword, formik.errors.confirmPassword)}
                    placeholder="••••••••"
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500">{formik.errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-opacity
                bg-foreground text-background
                disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85"
            >
              {isLoading ? "Creating your workspace…" : "Create workspace"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-foreground opacity-60 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-medium opacity-100 underline underline-offset-2 hover:opacity-80 transition-opacity">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
