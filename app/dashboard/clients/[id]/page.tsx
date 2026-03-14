import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import ClientDetailClient from "@/components/clients/ClientDetailClient";
import type { Client, UserRole } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = await auth.api.getSession({ headers: await headers() });
  const token = raw?.session.token;
  const role = ((raw?.user as { role?: string })?.role ?? "STAFF") as UserRole;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API_BASE}/clients/${id}`, {
    headers: authHeader,
    next: { tags: ["clients"] },
  });

  if (res.status === 404) notFound();
  if (!res.ok) notFound();

  const client: Client = await res.json();

  return <ClientDetailClient client={client} role={role} />;
}
