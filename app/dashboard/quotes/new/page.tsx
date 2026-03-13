import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import NewQuoteForm from "@/components/quotes/NewQuoteForm";
import type { Client } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

export default async function NewQuotePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const token = session?.session.token;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}/clients`, {
    headers: authHeader,
    next: { tags: ["clients"] },
  });
  const clients: Client[] = res.ok ? await res.json() : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/quotes"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Quotes
        </Link>
        <h1 className="font-serif text-3xl font-bold text-slate-900 leading-tight">New Quote</h1>
        <p className="font-serif italic text-slate-400 mt-1">
          Create a draft proposal — add items and submit for approval when ready.
        </p>
      </div>
      <NewQuoteForm clients={clients} />
    </div>
  );
}
