import { Suspense } from "react";
import { serverFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import ClientTableClient from "@/components/clients/ClientTableClient";
import ClientSheet from "@/components/clients/ClientSheet";
import type { Client } from "@/types";

async function getClients(): Promise<Client[]> {
  const res = await serverFetch("/clients", { next: { tags: ["clients"] } });
  if (!res.ok) return [];
  return res.json();
}

async function ClientsSection() {
  const clients = await getClients();
  return (
    <>
      <ClientTableClient clients={clients} />
      <ClientSheet clients={clients} />
    </>
  );
}

function ClientsSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-32 ml-auto" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your client database and contact information.</p>
      </div>
      <Suspense fallback={<ClientsSkeleton />}>
        <ClientsSection />
      </Suspense>
    </div>
  );
}
