import { useEffect, useRef, ReactNode } from 'react';

interface Props {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  children: ReactNode;
  threshold?: number;
}

export default function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  children,
  threshold = 200,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, threshold]);

  return (
    <div>
      {children}
      <div ref={sentinelRef} className="h-px" />
      {loading && hasMore && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
