import Link from 'next/link';
import Image from 'next/image';
import { IPostsList } from '@/interfaces/blog/IPost';

interface SidebarAuthorsProps {
  posts: IPostsList[];
}

import { mediaUrl } from '@/utils/mediaUrl';

function uniqueAuthors(posts: IPostsList[]) {
  const seen = new Set<string>();
  return posts.reduce<IPostsList['user'][]>((acc, post) => {
    const username = post?.user?.username;
    if (username && !seen.has(username)) {
      seen.add(username);
      acc.push(post.user);
    }
    return acc;
  }, []);
}

const MAX_AUTHORS = 5;

export default function SidebarAuthors({ posts }: SidebarAuthorsProps) {
  const authors = uniqueAuthors(posts).slice(0, MAX_AUTHORS);
  if (authors.length === 0) return null;

  return (
    <div className="dark:border-dark-third dark:bg-dark-bg rounded-2xl border border-gray-200 bg-gray-50/50 p-4">
      <h3 className="dark:text-dark-txt text-lg font-bold text-gray-900">Autores activos</h3>
      <p className="dark:text-dark-txt-secondary mt-0.5 text-xs text-gray-500">
        Personas que están publicando
      </p>
      <ul className="mt-3 space-y-2">
        {authors.map((author) => (
          <li key={author.username}>
            <Link
              href={`/@/${author.username}`}
              className="dark:hover:bg-dark-second flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white"
            >
              {author.profile_picture ? (
                <Image
                  width={36}
                  height={36}
                  alt=""
                  src={mediaUrl(author.profile_picture)}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span className="dark:bg-dark-third dark:text-dark-txt flex h-9 w-9 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-600">
                  {author.username?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
              <div className="min-w-0">
                <p className="dark:text-dark-txt truncate text-sm font-medium text-gray-900">
                  {author.username}
                </p>
                <p className="dark:text-dark-txt-secondary truncate text-xs text-gray-500">
                  @{author.username}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
