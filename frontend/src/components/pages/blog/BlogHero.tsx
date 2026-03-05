import { IPostsList } from '@/interfaces/blog/IPost';
import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import { mediaUrl } from '@/utils/mediaUrl';

interface Props {
  post: IPostsList;
}

export default function BlogHero({ post }: Props) {
  const postUrl = `/blog/post/${post?.slug}`;

  return (
    <Link href={postUrl} className="group block">
      <article className="relative isolate overflow-hidden rounded-2xl bg-gray-900">
        {/* Background image */}
        <div className="relative aspect-[2/1] sm:aspect-[3/1] lg:aspect-[3.5/1]">
          {post?.thumbnail ? (
            <Image
              fill
              alt={post?.title || ''}
              src={mediaUrl(post.thumbnail)}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 1280px"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-fuchsia-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          {post?.category?.name && (
            <span className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm">
              {post.category.name}
            </span>
          )}
          <h2 className="max-w-2xl text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
            {post?.title}
          </h2>
          {post?.description && (
            <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/70 sm:text-base">
              {post.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-3">
            {post?.user?.profile_picture ? (
              <Image
                width={32}
                height={32}
                alt=""
                src={mediaUrl(post.user.profile_picture)}
                className="size-8 rounded-full object-cover ring-2 ring-white/20"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
                {post?.user?.username?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
            <div className="text-sm">
              <span className="font-medium text-white">{post?.user?.username}</span>
              <span className="mx-1.5 text-white/40">·</span>
              <time className="text-white/60" dateTime={post?.created_at}>
                {post?.created_at ? moment(post.created_at).fromNow() : ''}
              </time>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
