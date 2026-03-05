export default function LoadingPostCard() {
  return (
    <article className="dark:border-dark-third dark:bg-dark-bg overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="dark:bg-dark-third size-9 shrink-0 animate-pulse rounded-full bg-gray-200" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="dark:bg-dark-third h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="dark:bg-dark-second h-2.5 w-32 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      {/* Image skeleton */}
      <div className="dark:bg-dark-third aspect-[4/3] w-full animate-pulse bg-gray-200" />
      {/* Actions skeleton */}
      <div className="flex gap-1 px-3 py-2">
        <div className="dark:bg-dark-second size-8 animate-pulse rounded-full bg-gray-100" />
        <div className="dark:bg-dark-second size-8 animate-pulse rounded-full bg-gray-100" />
        <div className="dark:bg-dark-second size-8 animate-pulse rounded-full bg-gray-100" />
      </div>
      {/* Caption skeleton */}
      <div className="space-y-1 px-4 pb-4">
        <div className="dark:bg-dark-second h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="dark:bg-dark-second h-4 w-4/5 animate-pulse rounded bg-gray-100" />
      </div>
    </article>
  );
}
