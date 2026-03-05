import { useState, useCallback } from 'react';

interface UseBookmarkOptions {
  slug: string;
  initialBookmarked: boolean;
}

export default function useBookmark({ slug, initialBookmarked }: UseBookmarkOptions) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (loading || !slug) return;
    setLoading(true);

    const method = bookmarked ? 'DELETE' : 'POST';
    const url = bookmarked
      ? `/api/profile/bookmarks?slug=${encodeURIComponent(slug)}`
      : '/api/profile/bookmarks';

    try {
      const res = await fetch(url, {
        method,
        ...(method === 'POST' && {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        }),
      });
      if (res.ok) {
        setBookmarked((prev) => !prev);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [slug, bookmarked, loading]);

  return { bookmarked, loading, toggle };
}
