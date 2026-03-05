import { useState, useCallback } from 'react';

interface UseLikeOptions {
  slug: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function useLike({ slug, initialLiked, initialCount }: UseLikeOptions) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const method = liked ? 'DELETE' : 'POST';
    const url = liked
      ? `/api/blog/post/like?slug=${encodeURIComponent(slug)}`
      : '/api/blog/post/like';

    try {
      const res = await fetch(url, {
        method,
        ...(method === 'POST' && {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        }),
      });

      if (res.ok) {
        setLiked((prev) => !prev);
        setCount((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch {
      // silently fail — optimistic UI already handles
    } finally {
      setLoading(false);
    }
  }, [slug, liked, loading]);

  return { liked, count, loading, toggle };
}
