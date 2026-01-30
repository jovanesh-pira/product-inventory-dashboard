export default function RecentSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 animate-pulse"
        >
          <div className="h-10 w-10 rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-slate-200" />
            <div className="h-3 w-1/4 rounded bg-slate-200" />
          </div>
          <div className="h-4 w-10 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
