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

// ── Quotes ──────────────────────────────────────────────────────────────────

export async function createQuote(data: {
  clientId: string;
  eventStartDate?: string | null;
  eventEndDate?: string | null;
  notes?: string | null;
}) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to create quote" }));
    throw new Error(e.message ?? "Failed to create quote");
  }
  revalidateTag("quotes", "max");
  return res.json();
}

export async function updateQuote(
  id: string,
  data: {
    globalDiscount?: number;
    includeVat?: boolean;
    eventStartDate?: string | null;
    eventEndDate?: string | null;
    notes?: string | null;
  }
) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to update quote" }));
    throw new Error(e.message ?? "Failed to update quote");
  }
  revalidatePath(`/dashboard/quotes/${id}`);
  revalidateTag("quotes", "max");
}

// ── Quote Items ──────────────────────────────────────────────────────────────

export async function addQuoteItem(
  quoteId: string,
  data: {
    type: string;
    description: string;
    assetId?: string;
    quantity: number;
    days?: number;
    rate?: number;
    discountAmount?: number;
  }
) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes/${quoteId}/items`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to add item" }));
    throw new Error(e.message ?? "Failed to add item");
  }
  revalidatePath(`/dashboard/quotes/${quoteId}`);
}

export async function updateQuoteItem(
  quoteId: string,
  itemId: string,
  data: {
    description?: string;
    quantity?: number;
    days?: number;
    discountAmount?: number;
  }
) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes/${quoteId}/items/${itemId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to update item" }));
    throw new Error(e.message ?? "Failed to update item");
  }
  revalidatePath(`/dashboard/quotes/${quoteId}`);
}

export async function removeQuoteItem(quoteId: string, itemId: string) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes/${quoteId}/items/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to remove item" }));
    throw new Error(e.message ?? "Failed to remove item");
  }
  revalidatePath(`/dashboard/quotes/${quoteId}`);
}

// ── Status Transitions ───────────────────────────────────────────────────────

export async function submitQuote(id: string) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes/${id}/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to submit quote" }));
    throw new Error(e.message ?? "Failed to submit quote");
  }
  revalidatePath(`/dashboard/quotes/${id}`);
  revalidateTag("quotes", "max");
}

export async function approveQuote(id: string) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to approve quote" }));
    throw new Error(e.message ?? "Failed to approve quote");
  }
  revalidatePath(`/dashboard/quotes/${id}`);
  revalidateTag("quotes", "max");
  revalidateTag("events", "max");
  revalidateTag("assets", "max");
  return res.json();
}

export async function cancelQuote(id: string) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes/${id}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to cancel quote" }));
    throw new Error(e.message ?? "Failed to cancel quote");
  }
  revalidatePath(`/dashboard/quotes/${id}`);
  revalidateTag("quotes", "max");
}

// ── Payment Proofs ───────────────────────────────────────────────────────────

export async function uploadPaymentProof(quoteId: string, formData: FormData) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes/${quoteId}/payment-proof`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to upload proof" }));
    throw new Error(e.message ?? "Failed to upload proof");
  }
  revalidatePath(`/dashboard/quotes/${quoteId}`);
}

export async function deletePaymentProof(quoteId: string, proofId: string) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/quotes/${quoteId}/payment-proof/${proofId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to delete proof" }));
    throw new Error(e.message ?? "Failed to delete proof");
  }
  revalidatePath(`/dashboard/quotes/${quoteId}`);
}
