import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import { mediaUrl } from '@/utils/mediaUrl';
import useLike from '@/hooks/useLike';
import useBookmark from '@/hooks/useBookmark';
import ShareButton from '@/components/shared/ShareButton';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';
import type { IPost } from '@/interfaces/blog/IPost';

interface Props {
  post: IPost;
}

export default function PostDetail({ post }: Props) {
  const { liked, count: likesCount, toggle: toggleLike } = useLike({
    slug: post.slug,
    initialLiked: post.has_liked ?? false,
    initialCount: post.likes_count ?? 0,
  });

  const { bookmarked, toggle: toggleBookmark } = useBookmark({
    slug: post.slug,
    initialBookmarked: false,
  });

  return (
    <article>
      {/* Author header */}
      <div className="mb-4 flex items-center gap-3">
        <Link href={`/@/${post.user?.username}/`} className="shrink-0">
          {post.user?.profile_picture ? (
            <Image
              width={40}
              height={40}
              alt=""
              src={mediaUrl(post.user.profile_picture)}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900 dark:text-violet-300">
              {post.user?.username?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </Link>
        <div>
          <Link
            href={`/@/${post.user?.username}/`}
            className="text-sm font-semibold text-gray-900 hover:underline dark:text-dark-txt"
          >
            {post.user?.first_name} {post.user?.last_name}
          </Link>
          <p className="text-xs text-gray-400 dark:text-dark-txt-secondary">
            @{post.user?.username} &middot;{' '}
            <time dateTime={post.created_at}>
              {moment(post.created_at).format('D MMM YYYY, HH:mm')}
            </time>
          </p>
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-3 text-xl font-bold leading-tight text-gray-900 sm:text-2xl dark:text-dark-txt">
        {post.title}
      </h1>

      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="mb-4 overflow-hidden rounded-xl">
          <Image
            src={mediaUrl(post.thumbnail)}
            alt={post.title}
            width={800}
            height={450}
            className="w-full object-cover"
            priority
          />
        </div>
      )}

      {/* Description */}
      {post.description && (
        <p className="mb-4 text-base text-gray-600 dark:text-dark-txt-secondary">
          {post.description}
        </p>
      )}

      {/* Content body (HTML) */}
      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Stats & actions bar — Twitter style */}
      <div className="mt-6 border-t border-gray-100 dark:border-dark-third">
        {/* Metrics row */}
        <div className="flex items-center gap-4 px-1 py-3 text-[13px] text-gray-500 dark:text-dark-txt-secondary">
          {likesCount > 0 && (
            <span>
              <strong className="font-bold text-gray-900 dark:text-dark-txt">{likesCount}</strong>{' '}
              {likesCount === 1 ? 'Me gusta' : 'Me gusta'}
            </span>
          )}
          {post.comments_count > 0 && (
            <span>
              <strong className="font-bold text-gray-900 dark:text-dark-txt">{post.comments_count}</strong>{' '}
              {post.comments_count === 1 ? 'Comentario' : 'Comentarios'}
            </span>
          )}
          {Number(post.view_count) > 0 && (
            <span>
              <strong className="font-bold text-gray-900 dark:text-dark-txt">{Number(post.view_count).toLocaleString()}</strong>{' '}
              Vistas
            </span>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex items-center justify-around border-t border-gray-100 py-1 dark:border-dark-third">
          <button
            type="button"
            onClick={toggleLike}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors duration-200 ${
              liked
                ? 'text-red-500 hover:bg-red-500/10'
                : 'text-gray-500 hover:bg-red-500/10 hover:text-red-500 dark:text-dark-txt-secondary'
            }`}
            aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
          >
            <span className="inline-flex transition-transform duration-200 active:scale-125">
              {liked ? <HeartIconSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
            </span>
          </button>

          <a
            href="#comments"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-gray-500 transition hover:bg-sky-500/10 hover:text-sky-500 dark:text-dark-txt-secondary"
            aria-label="Comentarios"
          >
            <ChatBubbleOvalLeftIcon className="h-5 w-5" />
          </a>

          <ShareButton
            title={post.title}
            url={`/blog/post/${post.slug}`}
            className="text-gray-500 hover:bg-sky-500/10 hover:text-sky-500 dark:text-dark-txt-secondary"
          />

          <button
            type="button"
            onClick={toggleBookmark}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors ${
              bookmarked
                ? 'text-violet-600 hover:bg-violet-500/10'
                : 'text-gray-500 hover:bg-violet-500/10 hover:text-violet-600 dark:text-dark-txt-secondary'
            }`}
            aria-label={bookmarked ? 'Quitar de guardados' : 'Guardar'}
          >
            {bookmarked ? (
              <BookmarkIconSolid className="h-5 w-5" />
            ) : (
              <BookmarkIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
