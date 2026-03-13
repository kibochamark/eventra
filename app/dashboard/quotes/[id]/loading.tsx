import { Skeleton } from "@/components/ui/skeleton";

export default function QuoteDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="flex items-start justify-between">
        <div className="space-y-2"><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-48" /></div>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-2xl bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200"><Skeleton className="h-4 w-24" /></div>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-28" /></div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
