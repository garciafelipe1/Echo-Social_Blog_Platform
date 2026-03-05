import { IPostsList } from '@/interfaces/blog/IPost';
import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import useLike from '@/hooks/useLike';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ArrowPathRoundedSquareIcon,
  ChartBarIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ShareButton from '@/components/shared/ShareButton';
import { formatCompact } from '@/utils/formatNumber';
import { mediaUrl } from '@/utils/mediaUrl';

interface FeedPostCardProps {
  post: IPostsList;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export default function FeedPostCard({ post }: FeedPostCardProps) {
  const postUrl = `/blog/post/${post?.slug}`;
  const userUrl = `/@/${post?.user?.username || ''}`;
  const {
    liked,
    count: likesCount,
    toggle: toggleLike,
  } = useLike({
    slug: post?.slug,
    initialLiked: post?.has_liked ?? false,
    initialCount: post?.likes_count ?? 0,
  });

  const commentsCount = post?.comments_count ?? 0;
  const recentComments = post?.recent_comments ?? [];

  return (
    <article
      className="dark:border-dark-third dark:hover:bg-dark-second/50 border-b border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50/50"
      role="article"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={userUrl} className="shrink-0 pt-0.5">
          {post?.user?.profile_picture ? (
            <Image
              width={40}
              height={40}
              alt=""
              src={mediaUrl(post.user.profile_picture)}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
              {post?.user?.username?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          {/* Header: name · @category · time */}
          <div className="flex items-baseline gap-1 text-[15px]">
            <Link
              href={userUrl}
              className="dark:text-dark-txt truncate font-bold text-gray-900 hover:underline"
            >
              {post?.user?.username || 'Anonimo'}
            </Link>
            <span className="dark:text-dark-txt-secondary text-sm text-gray-500">
              @{post?.category?.slug || 'post'}
            </span>
            <span className="dark:text-dark-border text-gray-300">&middot;</span>
            <time
              dateTime={post?.created_at}
              className="dark:text-dark-txt-secondary shrink-0 text-sm text-gray-500 hover:underline"
              title={post?.created_at ? moment(post.created_at).format('HH:mm · D MMM YYYY') : ''}
            >
              {post?.created_at ? moment(post.created_at).fromNow(true) : ''}
            </time>
          </div>

          {/* Text */}
          <Link href={postUrl} className="block outline-none">
            <p className="dark:text-dark-txt text-[15px] leading-normal text-gray-900">
              {post?.description || post?.title}
            </p>

            {/* Image card */}
            {post?.thumbnail && (
              <div className="dark:border-dark-third mt-3 overflow-hidden rounded-2xl border border-gray-200">
                <Image
                  width={510}
                  height={287}
                  alt={post?.title || ''}
                  src={mediaUrl(post.thumbnail)}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 600px) 100vw, 510px"
                />
              </div>
            )}
          </Link>

          {/* Action bar — Twitter style */}
          <div className="dark:text-dark-txt-secondary -ml-2 mt-1 flex items-center justify-between text-gray-500">
            <Link
              href={`${postUrl}#comments`}
              className="group/btn flex items-center gap-1 rounded-full p-2 hover:bg-sky-500/10 hover:text-sky-500"
              aria-label="Comentar"
            >
              <ChatBubbleOvalLeftIcon className="h-[18px] w-[18px]" />
              <span className="min-w-[1ch] text-[13px]">
                {commentsCount > 0 ? commentsCount : ''}
              </span>
            </Link>
            <button
              type="button"
              className="group/btn flex items-center gap-1 rounded-full p-2 hover:bg-emerald-500/10 hover:text-emerald-500"
              aria-label="Repost"
            >
              <ArrowPathRoundedSquareIcon className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={toggleLike}
              className={`group/btn flex items-center gap-1 rounded-full p-2 transition-colors duration-200 ${
                liked
                  ? 'text-red-500 hover:bg-red-500/10'
                  : 'hover:bg-red-500/10 hover:text-red-500'
              }`}
              aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
            >
              <span className="inline-flex transition-transform duration-200 active:scale-125">
                {liked ? (
                  <HeartIconSolid className="h-[18px] w-[18px]" />
                ) : (
                  <HeartIcon className="h-[18px] w-[18px]" />
                )}
              </span>
              <span className="min-w-[1ch] text-[13px]">{likesCount > 0 ? likesCount : ''}</span>
            </button>
            <Link
              href={postUrl}
              className="group/btn flex items-center gap-1 rounded-full p-2 hover:bg-sky-500/10 hover:text-sky-500"
              aria-label="Vistas"
            >
              <ChartBarIcon className="h-[18px] w-[18px]" />
              <span className="min-w-[1ch] text-[13px]">
                {formatCompact(post?.view_count ?? 0)}
              </span>
            </Link>
            <div className="flex items-center">
              <button
                type="button"
                className="rounded-full p-2 hover:bg-sky-500/10 hover:text-sky-500"
                aria-label="Guardar"
              >
                <BookmarkIcon className="h-[18px] w-[18px]" />
              </button>
              <ShareButton
                title={post?.title || ''}
                url={postUrl}
                slug={post?.slug}
                className="rounded-full p-2 hover:bg-sky-500/10 hover:text-sky-500"
              />
            </div>
          </div>

          {/* Comment previews (Instagram style) */}
          {commentsCount > 0 && (
            <div className="mt-1">
              {commentsCount > 2 && (
                <Link
                  href={`${postUrl}#comments`}
                  className="dark:text-dark-txt-secondary mb-1 block text-[13px] text-gray-400 hover:text-gray-500"
                >
                  Ver los {commentsCount} comentarios
                </Link>
              )}
              {recentComments.map((comment) => (
                <div key={comment.id} className="flex gap-1 text-[13px] leading-snug">
                  <Link
                    href={`/@/${comment.username}`}
                    className="dark:text-dark-txt shrink-0 font-semibold text-gray-900 hover:underline"
                  >
                    {comment.username}
                  </Link>
                  <span className="dark:text-dark-txt-secondary line-clamp-1 text-gray-700">
                    {stripHtml(comment.content)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
