import Head from 'next/head';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { ReactElement } from 'react';
import type { RootState } from '@/redux/reducers';

import Layout from '@/hocs/Layout';
import BlogPageHeader from '@/components/pages/blog/BlogPageHeader';
import BlogHero from '@/components/pages/blog/BlogHero';
import BlogHeroSkeleton from '@/components/pages/blog/BlogHeroSkeleton';
import PostCard from '@/components/pages/blog/PostCard';
import LoadingPostCard from '@/components/loaders/LoaderPostCard';
import InfiniteScroll from '@/components/shared/InfiniteScroll';
import BlogDemoTools from '@/components/pages/blog/BlogDemoTools';
import useCategories from '@/hooks/useCategories';
import usePosts from '@/hooks/usePosts';

export default function BlogPage() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const { categories } = useCategories();

  const {
    posts: featuredPosts,
    loading: loadingFeatured,
    refetch: refetchFeatured,
  } = usePosts({ showFeatured: true });

  const { posts, loading, loadMore, loadingMore, nextUrl, refetch } = usePosts({
    showFeatured: false,
    category: activeCategory || undefined,
  });

  const heroPost = featuredPosts[0] ?? null;

  const handleCategoryChange = useCallback((slug: string) => {
    setActiveCategory(slug);
  }, []);

  const filteredPosts = useMemo(() => {
    if (!debouncedSearch) return posts;
    const q = debouncedSearch.toLowerCase();
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.user?.username?.toLowerCase().includes(q),
    );
  }, [posts, debouncedSearch]);

  const refetchAll = useCallback(() => {
    refetch();
    refetchFeatured();
  }, [refetch, refetchFeatured]);

  const showDevTools = isAuthenticated && process.env.NODE_ENV === 'development';

  return (
    <>
      <Head>
        <title>Blog | Echo</title>
        <meta
          name="description"
          content="Explora publicaciones por categoría. Posts destacados, autores y más en Echo."
        />
        <meta property="og:title" content="Blog | Echo" />
      </Head>
      <div className="dark:bg-dark-main min-h-screen bg-gray-50">
        <BlogPageHeader
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Dev tools (solo en dev + autenticado) */}
          {showDevTools && (
            <div className="mb-6">
              <BlogDemoTools onRefetchAfterGenerate={refetchAll} />
            </div>
          )}

          {/* Hero post destacado */}
          {!activeCategory && !debouncedSearch && (
            <section className="mb-8 sm:mb-10">
              {loadingFeatured ? <BlogHeroSkeleton /> : heroPost && <BlogHero post={heroPost} />}
            </section>
          )}

          {/* Grid de posts */}
          <section>
            {loading && !posts.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <LoadingPostCard key={i} />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="dark:bg-dark-second mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="size-7 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                </div>
                <p className="dark:text-dark-txt text-sm font-medium text-gray-900">
                  No se encontraron publicaciones
                </p>
                <p className="dark:text-dark-txt-secondary mt-1 text-sm text-gray-500">
                  {debouncedSearch
                    ? `Sin resultados para "${debouncedSearch}"`
                    : 'Aún no hay publicaciones en esta categoría.'}
                </p>
              </div>
            ) : (
              <InfiniteScroll
                hasMore={!!nextUrl && !debouncedSearch}
                loading={loadingMore}
                onLoadMore={loadMore}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

BlogPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
