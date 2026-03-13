import { Skeleton } from "@/components/ui/skeleton";

export default function QuotesLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1"><Skeleton className="h-8 w-28" /><Skeleton className="h-4 w-64" /></div>
      <div className="rounded-2xl bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-8 ml-auto" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
