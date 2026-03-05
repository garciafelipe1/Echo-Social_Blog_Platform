import { IPostsList } from '@/interfaces/blog/IPost';
import PostCard from '@/components/pages/blog/PostCard';
import LoadingPostCard from '@/components/loaders/LoaderPostCard';
import Link from 'next/link';

interface LatestPostsSectionProps {
  posts: IPostsList[];
  loading: boolean;
}

const SECTION_TITLE = 'Últimas publicaciones';
const SECTION_DESCRIPTION = 'Lo más reciente de la comunidad.';
const POSTS_TO_SHOW = 6;

export default function LatestPostsSection({ posts, loading }: LatestPostsSectionProps) {
  const displayPosts = posts.slice(0, POSTS_TO_SHOW);

  return (
    <section aria-labelledby="latest-heading" className="border-t border-gray-200/80 bg-gray-50/50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="latest-heading" className="text-2xl font-semibold tracking-tight text-gray-900">
              {SECTION_TITLE}
            </h2>
            <p className="mt-1 text-gray-600">{SECTION_DESCRIPTION}</p>
          </div>
          <Link
            href="/blog"
            className="text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            Ver todo el blog →
          </Link>
        </div>

        {loading ? (
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: POSTS_TO_SHOW }).map((_, i) => (
              <LoadingPostCard key={i} />
            ))}
          </div>
        ) : displayPosts.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            Aún no hay publicaciones. <Link href="/blog" className="text-violet-600 hover:underline">Explorar blog</Link>
          </p>
        ) : (
          <ul className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3">
            {displayPosts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
