import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import QuoteStatusBadge from "@/components/quotes/QuoteStatusBadge";
import QuoteItemsTable from "@/components/quotes/QuoteItemsTable";
import PricingWaterfall from "@/components/quotes/PricingWaterfall";
import QuoteActions from "@/components/quotes/QuoteActions";
import EditQuoteHeaderForm from "@/components/quotes/EditQuoteHeaderForm";
import AddQuoteItemSheet from "@/components/quotes/AddQuoteItemSheet";
import type { Asset, Quote } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const token = session?.session.token;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const [quoteRes, assetsRes] = await Promise.all([
    fetch(`${API_BASE}/quotes/${id}`, { headers: authHeader, next: { tags: ["quotes"] } }),
    fetch(`${API_BASE}/assets`, { headers: authHeader, next: { tags: ["assets"] } }),
  ]);

  if (quoteRes.status === 404) notFound();
  if (!quoteRes.ok) notFound();

  const quote: Quote = await quoteRes.json();
  const assets: Asset[] = assetsRes.ok ? await assetsRes.json() : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link
          href="/dashboard/quotes"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          All Quotes
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-serif text-3xl font-bold text-slate-900 leading-tight">
            {quote.quoteNumber}
          </h1>
          <QuoteStatusBadge status={quote.status} size="lg" />
        </div>
        <p className="text-sm text-slate-400 mt-1">
          {quote.client.name}
          {quote.client.email && (
            <span className="ml-2 text-slate-300">· {quote.client.email}</span>
          )}
        </p>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-6">
        {/* Left — Quote header / client card */}
        <div className="order-2 lg:order-1">
          <EditQuoteHeaderForm quote={quote} />
        </div>

        {/* Centre — Line items + pricing */}
        <div className="order-3 lg:order-2 space-y-5">
          <QuoteItemsTable
            items={quote.items}
            quoteId={quote.id}
            status={quote.status}
          />
          <PricingWaterfall
            summary={quote.summary}
            includeVat={quote.includeVat}
            globalDiscount={quote.globalDiscount}
          />
        </div>

        {/* Right — Actions + proofs */}
        <div className="order-1 lg:order-3">
          <QuoteActions quote={quote} />
        </div>
      </div>

      {/* Sheet portal */}
      <AddQuoteItemSheet assets={assets} />
    </div>
  );
}
