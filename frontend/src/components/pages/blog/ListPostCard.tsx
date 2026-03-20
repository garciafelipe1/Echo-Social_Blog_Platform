import { IPostsList } from '@/interfaces/blog/IPost';
import { RootState } from '@/redux/reducers';
import { useState } from 'react';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { mediaUrl } from '@/utils/mediaUrl';
import useLike from '@/hooks/useLike';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ChartBarIcon,
  BookmarkIcon,
  ArrowUpTrayIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatCompact } from '@/utils/formatNumber';
import DeletPostModal from './DeletePostModal';
import EditPostModal from './EditPostModal';

interface ComponentsProps {
  post: IPostsList;
  handleDelete?: (slug: string) => Promise<void>;
  loadingDelete?: boolean;
}

export default function ListPostCard({
  post,
  handleDelete,
  loadingDelete = false,
}: ComponentsProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
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
    <article className="dark:border-dark-third dark:hover:bg-dark-second/50 group border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50/60">
      <div className="flex gap-2.5">
        {/* Avatar */}
        <Link href={`/@/${post?.user?.username}/`} className="shrink-0">
          {post?.user?.profile_picture ? (
            <Image
              width={32}
              height={32}
              alt={`Avatar de ${post.user?.username || 'autor'}`}
              src={mediaUrl(post.user.profile_picture)}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600 dark:bg-violet-900 dark:text-violet-300">
              {post?.user?.username?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-1 text-[13px] leading-tight">
            <Link
              href={`/@/${post?.user?.username}/`}
              className="dark:text-dark-txt truncate font-semibold text-gray-900 hover:underline"
            >
              {post?.user?.username}
            </Link>
            <span className="dark:text-dark-txt-secondary text-gray-400">·</span>
            <span className="dark:text-dark-txt-secondary shrink-0 text-gray-400">
              {post?.category?.name}
            </span>
            <span className="dark:text-dark-txt-secondary text-gray-400">·</span>
            <time
              dateTime={post?.created_at}
              className="dark:text-dark-txt-secondary shrink-0 text-gray-400"
              title={post?.created_at ? moment(post.created_at).format('LL [a las] HH:mm') : ''}
            >
              {post?.created_at ? moment(post.created_at).fromNow(true) : ''}
            </time>

            {/* Menu (edit/delete) */}
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setOpenMenu(!openMenu)}
                className="dark:hover:bg-dark-third dark:hover:text-dark-txt rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Más opciones"
              >
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </button>
              {openMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    aria-hidden
                    onClick={() => setOpenMenu(false)}
                  />
                  <div className="dark:border-dark-third dark:bg-dark-bg absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-0.5 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(false);
                        setOpenEdit(true);
                      }}
                      className="dark:text-dark-txt dark:hover:bg-dark-third flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(false);
                        setOpenDelete(true);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-3.5 w-3.5" /> Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content + thumbnail */}
          <Link href={postUrl} className="mt-0.5 flex gap-3 outline-none">
            <p className="dark:text-dark-txt line-clamp-2 flex-1 text-[14px] leading-snug text-gray-800">
              {post?.description || post?.title}
            </p>
            {post?.thumbnail && (
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <Image
                  width={56}
                  height={56}
                  alt={post?.title || ''}
                  src={mediaUrl(post.thumbnail)}
                  className="h-14 w-14 object-cover"
                />
              </div>
            )}
          </Link>

          {/* Actions — Twitter style */}
          <div className="dark:text-dark-txt-secondary -ml-2 mt-0.5 flex items-center justify-between text-gray-400">
            <button
              type="button"
              onClick={toggleLike}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors duration-200 ${
                liked
                  ? 'text-red-500 hover:bg-red-500/10'
                  : 'hover:bg-red-500/10 hover:text-red-500'
              }`}
              aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
            >
              <span className="inline-flex transition-transform duration-200 active:scale-125">
                {liked ? <HeartIconSolid className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />}
              </span>
              <span className="min-w-[1ch]">{likesCount > 0 ? likesCount : ''}</span>
            </button>
            <Link
              href={`${postUrl}#comments`}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs hover:bg-sky-500/10 hover:text-sky-500"
              aria-label="Comentar"
            >
              <ChatBubbleOvalLeftIcon className="h-4 w-4" />
              <span className="min-w-[1ch]">
                {(post?.comments_count ?? 0) > 0 ? post.comments_count : ''}
              </span>
            </Link>
            <Link
              href={postUrl}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs hover:bg-sky-500/10 hover:text-sky-500"
              aria-label="Vistas"
            >
              <ChartBarIcon className="h-4 w-4" />
              <span className="min-w-[1ch]">{formatCompact(post?.view_count ?? 0)}</span>
            </Link>
            <div className="flex items-center">
              <button
                type="button"
                className="rounded-full p-1 hover:bg-sky-500/10 hover:text-sky-500"
                aria-label="Guardar"
              >
                <BookmarkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full p-1 hover:bg-sky-500/10 hover:text-sky-500"
                aria-label="Compartir"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeletPostModal
        open={openDelete}
        setOpen={setOpenDelete}
        post={post}
        handleDelete={handleDelete || (() => Promise.resolve())}
        loadingDelete={loadingDelete}
      />
      <EditPostModal open={openEdit} setOpen={setOpenEdit} slug={post?.slug} />
    </article>
  );
}

ListPostCard.defaultProps = {
  handleDelete: undefined,
  loadingDelete: false,
};
