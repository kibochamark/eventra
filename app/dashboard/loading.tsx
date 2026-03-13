import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-8 w-10" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200"><Skeleton className="h-4 w-32" /></div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-3.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-6 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
