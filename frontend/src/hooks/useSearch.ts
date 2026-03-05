import { useState, useCallback, useRef } from 'react';

interface SearchResults {
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    user: { username: string; profile_picture: string | null };
  }>;
  users: Array<{
    username: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
  }>;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

const EMPTY: SearchResults = { posts: [], users: [], categories: [] };

export default function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    setQuery(q);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!q.trim()) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&type=all`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? data ?? EMPTY);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults(EMPTY);
  }, []);

  return { query, results, loading, search, clear };
}
