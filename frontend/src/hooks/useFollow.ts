import { useState, useCallback } from 'react';

interface UseFollowOptions {
  username: string;
  initialFollowing: boolean;
}

export default function useFollow({ username, initialFollowing }: UseFollowOptions) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (loading || !username) return;
    setLoading(true);

    const method = isFollowing ? 'DELETE' : 'POST';
    const url = isFollowing
      ? `/api/profile/follow?username=${encodeURIComponent(username)}`
      : '/api/profile/follow';

    try {
      const res = await fetch(url, {
        method,
        ...(method === 'POST' && {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        }),
      });

      if (res.ok) {
        setIsFollowing((prev) => !prev);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [username, isFollowing, loading]);

  return { isFollowing, loading, toggle };
}
