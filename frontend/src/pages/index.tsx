import Head from 'next/head';
import Layout from '@/hocs/Layout';
import {
  FeedLayout,
  FeedHeader,
  FeedPostCard,
  FeedSkeleton,
  FeedLeftSidebar,
  FeedComposer,
  FeedRightSidebar,
} from '@/components/home';
import InfiniteScroll from '@/components/shared/InfiniteScroll';
import usePosts from '@/hooks/usePosts';
import useCategories from '@/hooks/useCategories';
import Link from 'next/link';
import { ReactElement, useCallback, useState } from 'react';

const SKELETON_COUNT = 5;

export default function Home() {
  const [activeTab, setActiveTab] = useState<'for_you' | 'following'>('for_you');

  const {
    posts: forYouPosts,
    loading: loadingForYou,
    loadMore: loadMoreForYou,
    loadingMore: loadingMoreForYou,
    nextUrl: nextForYou,
    refetch: refetchForYou,
  } = usePosts({ showFeatured: false });

  const {
    posts: followingPosts,
    loading: loadingFollowing,
    loadMore: loadMoreFollowing,
    loadingMore: loadingMoreFollowing,
    nextUrl: nextFollowing,
    refetch: refetchFollowing,
  } = usePosts({ showFeatured: false, feed: 'following' });

  const handlePostCreated = useCallback(() => {
    refetchForYou();
    refetchFollowing();
  }, [refetchForYou, refetchFollowing]);

  const { posts: featuredPosts } = usePosts({ showFeatured: true });
  const { categories } = useCategories();

  const isFollowingTab = activeTab === 'following';
  const posts = isFollowingTab ? followingPosts : forYouPosts;
  const loading = isFollowingTab ? loadingFollowing : loadingForYou;
  const loadMore = isFollowingTab ? loadMoreFollowing : loadMoreForYou;
  const loadingMore = isFollowingTab ? loadingMoreFollowing : loadingMoreForYou;
  const hasMore = !!(isFollowingTab ? nextFollowing : nextForYou);

  return (
    <>
      <Head>
        <title>Inicio | Echo</title>
        <meta
          name="description"
          content="Tu feed de Echo. Descubre posts de la comunidad y sigue a tus autores favoritos."
        />
        <meta property="og:title" content="Echo - Red social y blog" />
        <meta
          property="og:description"
          content="Descubre y publica contenido. Likes, comentarios, seguir autores y más."
        />
      </Head>
      <main>
        <FeedLayout
          leftSidebar={<FeedLeftSidebar />}
          rightSidebar={
            <FeedRightSidebar
              featuredPosts={featuredPosts}
              latestPosts={forYouPosts}
              categories={categories}
            />
          }
        >
          <FeedHeader activeTab={activeTab} onTabChange={setActiveTab} />
          <FeedComposer onPostCreated={handlePostCreated} />
          <div className="min-h-[60vh]">
            {loading && posts.length === 0 ? (
              Array.from({ length: SKELETON_COUNT }).map((_, i) => <FeedSkeleton key={i} />)
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <p className="dark:text-dark-txt-secondary text-[15px] text-gray-500">
                  {isFollowingTab
                    ? 'No hay publicaciones de personas que sigues.'
                    : 'Aun no hay publicaciones en tu feed.'}
                </p>
                <Link
                  href="/blog"
                  className="mt-4 text-[15px] font-semibold text-violet-600 hover:underline"
                >
                  Explorar el blog
                </Link>
              </div>
            ) : (
              <InfiniteScroll hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore}>
                <ul className="list-none">
                  {posts.map((post) => (
                    <li key={post.id}>
                      <FeedPostCard post={post} />
                    </li>
                  ))}
                </ul>
              </InfiniteScroll>
            )}
          </div>
        </FeedLayout>
      </main>
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
