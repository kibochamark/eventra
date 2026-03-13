import { Skeleton } from "@/components/ui/skeleton";

export default function AssetDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="flex items-start justify-between">
        <div className="space-y-2"><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-32" /></div>
        <div className="text-right space-y-1"><Skeleton className="h-7 w-24" /><Skeleton className="h-3 w-20" /></div>
      </div>
      <div className="rounded-2xl bg-white p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-8 w-10 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200"><Skeleton className="h-4 w-36" /></div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
