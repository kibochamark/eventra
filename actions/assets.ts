"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

async function getBearerToken(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session.token) throw new Error("Not authenticated");
  return session.session.token;
}

export async function createAsset(formData: FormData) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/assets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  console.log("Create asset response", formData);
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to create asset" }));
    throw new Error(e.message ?? "Failed to create asset");
  }
  revalidateTag("assets", "max");
}

export async function updateAsset(id: string, data: Record<string, unknown>) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/assets/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to update asset" }));
    throw new Error(e.message ?? "Failed to update asset");
  }
  revalidateTag("assets", "max");
}

export async function deleteAsset(id: string) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/assets/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to delete asset" }));
    throw new Error(e.message ?? "Failed to delete asset");
  }
  revalidateTag("assets", "max");
}

export async function logStockMovement(assetId: string, formData: FormData) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/assets/${assetId}/move`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to log movement" }));
    throw new Error(e.message ?? "Failed to log movement");
  }
  revalidateTag("assets", "max");
}

export async function createCategory(formData: FormData) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/assets/categories`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to create category" }));
    throw new Error(e.message ?? "Failed to create category");
  }
  revalidatePath("/dashboard/categories");
}

export async function deleteCategory(id: string) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/assets/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to delete category" }));
    throw new Error(e.message ?? "Failed to delete category");
  }
  revalidateTag("categories", "max");
}
