import { IPostsList } from '@/interfaces/blog/IPost';
import Image from 'next/image';
import moment from 'moment';
import Link from 'next/link';
import useLike from '@/hooks/useLike';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon,
  BookmarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatCompact } from '@/utils/formatNumber';
import { mediaUrl } from '@/utils/mediaUrl';

interface ComponentProps {
  post: IPostsList;
}

export default function PostCard({ post }: ComponentProps) {
  const postUrl = `/blog/post/${post?.slug}`;
  const {
    liked,
    count: likesCount,
    toggle: toggleLike,
  } = useLike({
    slug: post?.slug,
    initialLiked: post?.has_liked ?? false,
    initialCount: post?.likes_count ?? 0,
  });

  return (
    <article className="group/card dark:border-dark-third dark:bg-dark-bg overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none">
      {/* Header: autor + tiempo + menú */}
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href={`/@/${post?.user?.username}/`} className="flex shrink-0 items-center gap-3">
          {post?.user?.profile_picture ? (
            <Image
              width={36}
              height={36}
              alt=""
              src={mediaUrl(post.user.profile_picture)}
              className="dark:ring-dark-third size-9 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
              {post?.user?.username?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
          <div className="min-w-0 text-left">
            <p className="dark:text-dark-txt truncate text-sm font-semibold text-gray-900">
              {post?.user?.username}
            </p>
            <p
              className="dark:text-dark-txt-secondary truncate text-xs text-gray-500"
              title={post?.created_at ? moment(post.created_at).format('LL [a las] HH:mm') : ''}
            >
              {post?.category?.name} · {post?.created_at ? moment(post.created_at).fromNow() : '—'}
            </p>
          </div>
        </Link>
        <button
          type="button"
          className="dark:hover:bg-dark-third dark:hover:text-dark-txt ml-auto rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Más opciones"
        >
          <EllipsisHorizontalIcon className="size-5" />
        </button>
      </header>

      {/* Imagen */}
      <Link href={postUrl} className="block">
        {post?.thumbnail ? (
          <div className="dark:bg-dark-second relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
            <Image
              fill
              alt={post?.title || 'Post'}
              src={mediaUrl(post.thumbnail)}
              className="object-cover"
              sizes="(max-width: 600px) 100vw, 600px"
            />
          </div>
        ) : (
          <div className="dark:from-dark-second dark:to-dark-third dark:text-dark-txt-secondary flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
            <span className="text-4xl font-light">{post?.title?.charAt(0) || '?'}</span>
          </div>
        )}
      </Link>

      {/* Actions — Twitter style */}
      <div className="dark:text-dark-txt-secondary flex items-center justify-between px-2 py-1.5 text-gray-500">
        <button
          type="button"
          onClick={toggleLike}
          className={`flex items-center gap-1 rounded-full p-1.5 transition-colors duration-200 ${
            liked ? 'text-red-500 hover:bg-red-500/10' : 'hover:bg-red-500/10 hover:text-red-500'
          }`}
          aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
        >
          <span className="inline-flex transition-transform duration-200 active:scale-125">
            {liked ? (
              <HeartIconSolid className="size-[18px]" />
            ) : (
              <HeartIcon className="size-[18px]" />
            )}
          </span>
          <span className="min-w-[1ch] text-xs">{likesCount > 0 ? likesCount : ''}</span>
        </button>
        <Link
          href={`${postUrl}#comments`}
          className="flex items-center gap-1 rounded-full p-1.5 hover:bg-sky-500/10 hover:text-sky-500"
          aria-label="Comentar"
        >
          <ChatBubbleOvalLeftIcon className="size-[18px]" />
          <span className="min-w-[1ch] text-xs">
            {(post?.comments_count ?? 0) > 0 ? post.comments_count : ''}
          </span>
        </Link>
        <Link
          href={postUrl}
          className="flex items-center gap-1 rounded-full p-1.5 hover:bg-sky-500/10 hover:text-sky-500"
          aria-label="Vistas"
        >
          <ChartBarIcon className="size-[18px]" />
          <span className="min-w-[1ch] text-xs">{formatCompact(post?.view_count ?? 0)}</span>
        </Link>
        <div className="flex items-center">
          <button
            type="button"
            className="rounded-full p-1.5 hover:bg-sky-500/10 hover:text-sky-500"
            aria-label="Guardar"
          >
            <BookmarkIcon className="size-[18px]" />
          </button>
          <button
            type="button"
            className="rounded-full p-1.5 hover:bg-sky-500/10 hover:text-sky-500"
            aria-label="Compartir"
          >
            <ArrowUpTrayIcon className="size-[18px]" />
          </button>
        </div>
      </div>

      {/* Caption / descripcion */}
      <div className="space-y-1 px-4 pb-2">
        <Link href={postUrl} className="block">
          <p className="dark:text-dark-txt line-clamp-2 text-sm text-gray-900">
            <span className="font-semibold">{post?.user?.username}</span>{' '}
            <span className="dark:text-dark-txt-secondary text-gray-700">
              {post?.description || post?.title}
            </span>
          </p>
        </Link>
      </div>

      {/* Comment previews (Instagram style) */}
      {(post?.comments_count ?? 0) > 0 && (
        <div className="space-y-0.5 px-4 pb-3">
          {(post?.comments_count ?? 0) > 2 && (
            <Link
              href={`${postUrl}#comments`}
              className="dark:text-dark-txt-secondary block text-[13px] text-gray-400 hover:text-gray-500"
            >
              Ver los {post.comments_count} comentarios
            </Link>
          )}
          {post?.recent_comments?.map((comment) => (
            <p key={comment.id} className="line-clamp-1 text-sm">
              <Link
                href={`/@/${comment.username}`}
                className="dark:text-dark-txt font-semibold text-gray-900 hover:underline"
              >
                {comment.username}
              </Link>{' '}
              <span className="dark:text-dark-txt-secondary text-gray-600">
                {comment.content.replace(/<[^>]*>/g, '').trim()}
              </span>
            </p>
          ))}
        </div>
      )}
    </article>
  );
}
