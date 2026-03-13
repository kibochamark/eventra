import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3"><Skeleton className="h-8 w-48" /><Skeleton className="h-6 w-20 rounded-full" /></div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="rounded-2xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200"><Skeleton className="h-4 w-32" /></div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-8 ml-auto" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center px-5 py-3 border-t border-gray-200 bg-gray-50/50">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </div>
  );
}
