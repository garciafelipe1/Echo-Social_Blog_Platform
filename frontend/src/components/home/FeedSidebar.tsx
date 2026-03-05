import { IPostsList } from '@/interfaces/blog/IPost';
import Link from 'next/link';
import Image from 'next/image';

interface FeedSidebarProps {
  posts: IPostsList[];
}

import { mediaUrl } from '@/utils/mediaUrl';

export default function FeedSidebar({ posts }: FeedSidebarProps) {
  const list = posts.slice(0, 5);

  if (list.length === 0) return null;

  return (
    <div className="dark:border-dark-third dark:bg-dark-bg rounded-2xl border border-gray-200 bg-gray-50/50 p-4">
      <h3 className="dark:text-dark-txt text-lg font-bold text-gray-900">Destacados</h3>
      <p className="dark:text-dark-txt-secondary mt-0.5 text-sm text-gray-500">
        Publicaciones seleccionadas
      </p>
      <ul className="mt-4 space-y-3">
        {list.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blog/post/${post.slug}`}
              className="dark:hover:bg-dark-second block rounded-xl p-2 transition-colors hover:bg-white"
            >
              <div className="flex gap-3">
                {post.thumbnail ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      width={56}
                      height={56}
                      alt=""
                      src={mediaUrl(post.thumbnail)}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="dark:bg-dark-third dark:text-dark-txt-secondary flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-lg font-semibold text-gray-500">
                    {post.title?.charAt(0) || '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="dark:text-dark-txt truncate text-sm font-medium text-gray-900">
                    {post.title}
                  </p>
                  <p className="dark:text-dark-txt-secondary truncate text-xs text-gray-500">
                    @{post?.user?.username}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/blog"
        className="dark:text-dark-accent dark:hover:bg-dark-second mt-3 block rounded-xl py-2 text-center text-sm font-medium text-violet-600 hover:bg-white hover:text-violet-700"
      >
        Ver todo
      </Link>
    </div>
  );
}
