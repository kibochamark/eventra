"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { User, UserRole } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

async function getBearerToken(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session.token) throw new Error("Not authenticated");
  return session.session.token;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<User> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to create user" }));
    throw new Error(e.message ?? "Failed to create user");
  }
  revalidateTag("users", "max");
  return res.json();
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string }
): Promise<User> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to update user" }));
    throw new Error(e.message ?? "Failed to update user");
  }
  revalidateTag("users", "max");
  return res.json();
}

export async function changeUserRole(id: string, role: UserRole): Promise<User> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/users/${id}/role`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to change role" }));
    throw new Error(e.message ?? "Failed to change role");
  }
  revalidateTag("users", "max");
  return res.json();
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/users/${id}/password`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to reset password" }));
    throw new Error(e.message ?? "Failed to reset password");
  }
}

export async function deactivateUser(id: string): Promise<User> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/users/${id}/deactivate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to deactivate user" }));
    throw new Error(e.message ?? "Failed to deactivate user");
  }
  revalidateTag("users", "max");
  return res.json();
}

export async function activateUser(id: string): Promise<User> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/users/${id}/activate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to activate user" }));
    throw new Error(e.message ?? "Failed to activate user");
  }
  revalidateTag("users", "max");
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: "Failed to delete user" }));
    throw new Error(e.message ?? "Failed to delete user");
  }
  revalidateTag("users", "max");
}
