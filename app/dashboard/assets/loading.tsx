import { Skeleton } from "@/components/ui/skeleton";

export default function AssetsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page heading */}
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-2 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl ml-auto" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex gap-1.5">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
