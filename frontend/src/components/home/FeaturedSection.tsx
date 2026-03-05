import { IPostsList } from '@/interfaces/blog/IPost';
import PostCard from '@/components/pages/blog/PostCard';
import BlogHero from '@/components/pages/blog/BlogHero';
import BlogHeroSkeleton from '@/components/pages/blog/BlogHeroSkeleton';
import LoadingPostCard from '@/components/loaders/LoaderPostCard';
import Link from 'next/link';

interface FeaturedSectionProps {
  posts: IPostsList[];
  loading: boolean;
}

export default function FeaturedSection({ posts, loading }: FeaturedSectionProps) {
  if (loading) {
    return (
      <section aria-labelledby="featured-heading" className="bg-white py-12 sm:py-16 dark:bg-dark-main">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 h-5 w-28 animate-pulse rounded bg-gray-200 dark:bg-dark-third" />
          <BlogHeroSkeleton />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingPostCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) return null;

  const [heroPost, ...restPosts] = posts;

  return (
    <section aria-labelledby="featured-heading" className="bg-white py-12 sm:py-16 dark:bg-dark-main">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2
            id="featured-heading"
            className="text-lg font-bold tracking-tight text-gray-900 dark:text-dark-txt"
          >
            Destacados
          </h2>
          <Link
            href="/blog"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-dark-txt-secondary dark:hover:text-dark-txt"
          >
            Ver todo →
          </Link>
        </div>

        {heroPost && <BlogHero post={heroPost} />}

        {restPosts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restPosts.slice(0, 3).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
