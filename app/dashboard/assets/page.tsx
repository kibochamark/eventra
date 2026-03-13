import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import AssetTableClient from "@/components/assets/AssetTableClient";
import type { Asset, Category } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

async function AssetsSection() {
  const session = await auth.api.getSession({ headers: await headers() });
  const token = session?.session.token;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const [assets, categories] = await Promise.all([
    fetch(`${API_BASE}/assets`, { headers: authHeader, next: { tags: ["assets"] } }).then(
      (r) => (r.ok ? (r.json() as Promise<Asset[]>) : ([] as Asset[]))
    ),
    fetch(`${API_BASE}/assets/categories`, { headers: authHeader, next: { tags: ["categories"] } }).then(
      (r) => (r.ok ? (r.json() as Promise<Category[]>) : ([] as Category[]))
    ),
  ]);

  console.log("Fetched assets and categories", { assets, categories });

  return <AssetTableClient assets={assets} categories={categories} />;
}

function AssetsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-2">
            <div className="h-3 w-16 bg-slate-100 rounded-full" />
            <div className="h-7 w-10 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2" />
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssetsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 leading-tight">
          Asset Inventory
        </h1>
        <p className="font-serif italic text-slate-400 mt-1">
          Track every chair, tent, and flower arrangement across its full lifecycle.
        </p>
      </div>

      <Suspense fallback={<AssetsSkeleton />}>
        <AssetsSection />
      </Suspense>
    </div>
  );
}
