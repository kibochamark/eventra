import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, isVatRegistered, vatPercentage, name, email, password } = body;

    if (!companyName || !name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create tenant via Eventra Service API
    const tenantRes = await fetch(`${API_BASE}/api/v1/tenants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        ...(isVatRegistered !== undefined && { isVatRegistered }),
        ...(vatPercentage !== undefined && { vatPercentage }),
      }),
    });

    if (!tenantRes.ok) {
      const e = await tenantRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: (e as { message?: string }).message ?? "Failed to create tenant" },
        { status: tenantRes.status }
      );
    }

    const tenant = await tenantRes.json();
    const tenantId: string = tenant.id;

    // 2. Sign up user via Better Auth, passing tenantId + role so they are
    //    included in the INSERT (avoids the NOT NULL constraint violation).
    const signUpResponse = await auth.api.signUpEmail({
      body: { email, password, name, tenantId, role: "ADMIN" },
      headers: req.headers,
      asResponse: true,
    });

    if (!signUpResponse.ok) {
      const errorData = await signUpResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: (errorData as { message?: string }).message ?? "Failed to create user" },
        { status: signUpResponse.status }
      );
    }

    // Forward the session cookie(s) that Better Auth set so the browser is
    // automatically signed in after onboarding.
    const res = NextResponse.json({ success: true }, { status: 200 });
    const setCookie = signUpResponse.headers.get("set-cookie");
    if (setCookie) {
      res.headers.set("set-cookie", setCookie);
    }

    return res;
  } catch (error: unknown) {
    console.error("[onboard] error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
