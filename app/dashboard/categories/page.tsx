import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryPageClient from "@/components/assets/CategoryPageClient";
import type { Category } from "@/types";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

async function getCategories(): Promise<Category[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  const token = session?.session.token;
  const res = await fetch(`${API_BASE}/assets/categories`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { tags: ["categories"] },
  });
  if (!res.ok) return [];
  return res.json();
}

async function CategoriesSection() {
  const categories = await getCategories();
  // AddCategoryDialog is rendered inside CategoryPageClient to co-locate pendingParentId state
  return <CategoryPageClient categories={categories} />;
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 leading-tight">Asset Categories</h1>
        <p className="font-serif italic text-slate-400 mt-1">
          Organise your rental inventory into categories and subcategories.
        </p>
      </div>
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>
    </div>
  );
}
