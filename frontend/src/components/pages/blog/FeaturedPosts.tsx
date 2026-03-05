import { IPostsList } from '@/interfaces/blog/IPost';
import PostCardList from './PostCardList';
import FeaturePostCard from './FeaturePostCard';
import LoadingPostCard from '@/components/loaders/LoaderPostCard';

interface ComponentProps {
  posts: IPostsList[];
  loading: boolean;
}

const SECTION_TITLE = 'Destacados';

export default function FeaturedPosts({ posts, loading }: ComponentProps) {
  if (loading) {
    return (
      <section aria-labelledby="featured-heading" className="border-b border-gray-200 bg-white py-8 sm:py-12 dark:border-dark-third dark:bg-dark-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="featured-heading" className="text-xl font-semibold text-gray-900 dark:text-dark-txt">
            {SECTION_TITLE}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-2">
            <LoadingPostCard />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-dark-second" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) {
    return null;
  }

  const [featuredPost, ...restPosts] = posts;

  return (
    <section aria-labelledby="featured-heading" className="border-b border-gray-200 bg-white py-8 sm:py-12 dark:border-dark-third dark:bg-dark-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="featured-heading" className="text-xl font-semibold text-gray-900 dark:text-dark-txt">
          {SECTION_TITLE}
        </h2>
        <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-x-8 gap-y-8 sm:mt-8 sm:gap-y-12 lg:grid-cols-2 lg:gap-y-16">
          {featuredPost && <FeaturePostCard post={featuredPost} />}
          <div className="mx-auto w-full max-w-2xl border-t border-gray-200 pt-8 lg:mx-0 lg:max-w-none lg:border-t-0 lg:pt-0">
            <div className="-my-8 divide-y divide-gray-200">
              {restPosts.slice(0, 4).map((post) => (
                <PostCardList key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}