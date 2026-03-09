import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { auth } from "@/lib/auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, isVatRegistered, vatPercentage, name, email, password } = body;

    if (!companyName || !name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create tenant
    const tenantId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO "Tenant" (id, "companyName", "isVatRegistered", "vatPercentage", "createdAt")
       VALUES ($1, $2, $3, $4, NOW())`,
      [tenantId, companyName, isVatRegistered ?? false, vatPercentage ?? 16.0]
    );

    // 2. Sign up user via Better Auth, passing tenantId + role so they are
    //    included in the INSERT (avoids the NOT NULL constraint violation).
    const signUpResponse = await auth.api.signUpEmail({
      body: { email, password, name, tenantId, role: "ADMIN" },
      headers: req.headers,
      asResponse: true,
    });

    if (!signUpResponse.ok) {
      // Rollback tenant on user-creation failure
      await pool.query(`DELETE FROM "Tenant" WHERE id = $1`, [tenantId]);
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
