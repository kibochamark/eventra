import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1"><Skeleton className="h-8 w-28" /><Skeleton className="h-4 w-72" /></div>
      <div className="rounded-2xl bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
