import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-32" /></div>
      </div>
      <div className="rounded-2xl bg-white p-5 grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-36" /></div>
        ))}
      </div>
      <div className="rounded-2xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200"><Skeleton className="h-4 w-24" /></div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-8 ml-auto" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
