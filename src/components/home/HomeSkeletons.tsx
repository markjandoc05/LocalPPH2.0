import { Skeleton } from "@/components/ui/Skeleton";

export function CategoriesGridSkeleton() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-52 bg-slate-100" />
          <Skeleton className="h-4 w-72 bg-slate-100" />
        </div>
        <Skeleton className="h-5 w-28 bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
            <Skeleton className="h-5 w-32 bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturedBusinessesSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2 bg-slate-100" />
          <Skeleton className="h-4 w-64 bg-slate-100" />
        </div>
        <Skeleton className="h-5 w-16 bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <Skeleton className="h-48 w-full bg-slate-100" />
            <div className="p-6 flex-grow">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-full bg-slate-100" />
                <Skeleton className="h-6 w-32 bg-slate-100" />
              </div>
              <Skeleton className="h-4 w-full mb-2 bg-slate-100" />
              <Skeleton className="h-4 w-2/3 bg-slate-100" />
            </div>
            <div className="p-6 border-t border-slate-100">
              <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentlyAddedSkeleton() {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-44 mb-2 bg-slate-100" />
          <Skeleton className="h-4 w-64 bg-slate-100" />
        </div>
        <Skeleton className="h-5 w-32 bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0" />
            <div className="flex-grow">
              <Skeleton className="h-5 w-24 mb-1 bg-slate-100" />
              <Skeleton className="h-4 w-20 mb-1 bg-slate-100" />
              <Skeleton className="h-4 w-32 bg-slate-100" />
            </div>
            <Skeleton className="w-5 h-5 rounded bg-slate-100 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
