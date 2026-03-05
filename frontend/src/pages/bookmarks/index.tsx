import { useEffect, useState, useCallback } from 'react';
import Layout from '@/hocs/Layout';
import { ReactElement } from 'react';
import { IPostsList } from '@/interfaces/blog/IPost';
import ListPostCard from '@/components/pages/blog/ListPostCard';
import { BookmarkIcon } from '@heroicons/react/24/solid';

export default function BookmarksPage() {
  const [posts, setPosts] = useState<IPostsList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/bookmarks');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.results ?? data ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-8">
      <div className="mb-6 flex items-center gap-2">
        <BookmarkIcon className="h-6 w-6 text-violet-600" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-dark-txt">Guardados</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-dark-second" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400 dark:text-dark-txt-secondary">
          No tienes publicaciones guardadas.
        </p>
      ) : (
        <div>
          {posts.map((post) => (
            <ListPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

BookmarksPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
