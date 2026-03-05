export default function FeedSkeleton() {
  return (
    <div className="dark:border-dark-third border-b border-gray-200 px-4 py-3">
      <div className="flex gap-3">
        <div className="dark:bg-dark-third h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="dark:bg-dark-third h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="dark:bg-dark-second h-4 w-full max-w-md animate-pulse rounded bg-gray-100" />
          <div className="dark:bg-dark-second h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="dark:bg-dark-second mt-3 aspect-[2/1] w-full animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
