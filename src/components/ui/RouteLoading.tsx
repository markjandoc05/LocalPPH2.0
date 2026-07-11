interface RouteLoadingProps {
  title?: string;
  description?: string;
}

export function RouteLoading({
  title = "Loading page...",
  description = "Preparing the latest LocalPages.ph content.",
}: RouteLoadingProps) {
  return (
    <div className="flex-1 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 h-5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
