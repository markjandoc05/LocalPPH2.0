import { Skeleton } from "@/components/ui/Skeleton";

export function CategoriesGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm"
        >
          <Skeleton className="w-12 h-12 rounded-2xl mb-4 bg-slate-100" />
          <Skeleton className="h-5 w-24 mb-2 bg-slate-100" />
          <Skeleton className="h-3 w-16 bg-slate-100" />
        </div>
      ))}
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
      <div className="flex justify-between items-end mb-8">
        <div>
          <Skeleton className="h-8 w-40 mb-2 bg-slate-100" />
          <Skeleton className="h-4 w-48 bg-slate-100" />
        </div>
        <Skeleton className="h-5 w-28 bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0" />
            <div className="flex-grow">
              <Skeleton className="h-5 w-24 mb-1 bg-slate-100" />
              <Skeleton className="h-4 w-16 bg-slate-100" />
            </div>
            <Skeleton className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
