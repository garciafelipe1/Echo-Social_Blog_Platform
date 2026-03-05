export default function FeedSkeleton() {
  return (
    <div className="border-b border-gray-200 px-4 py-3 dark:border-dark-third">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-dark-third" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-dark-third" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-gray-100 dark:bg-dark-second" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-dark-second" />
          <div className="mt-3 aspect-[2/1] w-full animate-pulse rounded-2xl bg-gray-100 dark:bg-dark-second" />
        </div>
      </div>
    </div>
  );
}
