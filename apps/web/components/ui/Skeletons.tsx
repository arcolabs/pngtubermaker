export function AvatarCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

export function AvatarGridSkeleton({ count = 6 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((i) => (
        <AvatarCardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );
}
