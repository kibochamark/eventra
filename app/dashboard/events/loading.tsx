import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1"><Skeleton className="h-8 w-28" /><Skeleton className="h-4 w-80" /></div>
      {/* Tab strip skeleton */}
      <div className="flex items-center gap-1 rounded-2xl bg-white p-1.5 w-fit">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-4 w-16" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white overflow-hidden">
            <Skeleton className="h-24 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="border-t border-gray-200 px-5 py-3 flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
