"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Client } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

async function getBearerToken(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session.token) throw new Error("Not authenticated");
  return session.session.token;
}

export async function createClient(data: {
  name: string;
  isCorporate?: boolean;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}): Promise<Client> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/clients`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to create client" }));
    throw new Error(e.message ?? "Failed to create client");
  }
  revalidateTag("clients", "max");
  return res.json();
}

export async function updateClient(
  id: string,
  data: {
    name?: string;
    isCorporate?: boolean;
    email?: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
  }
): Promise<Client> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to update client" }));
    throw new Error(e.message ?? "Failed to update client");
  }
  revalidateTag("clients", "max");
  return res.json();
}

export async function deleteClient(id: string) {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to delete client" }));
    throw new Error(e.message ?? "Failed to delete client");
  }
  revalidateTag("clients", "max");
}
