import { Skeleton } from "@/components/ui/skeleton";

export default function NewQuoteLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1"><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-56" /></div>
      <div className="rounded-2xl bg-white p-6 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}
