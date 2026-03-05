import { IPostsList } from '@/interfaces/blog/IPost';
import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import { mediaUrl } from '@/utils/mediaUrl';
interface ComponentProps {
  post: IPostsList;
}

export default function FeaturedPostCard({ post }: ComponentProps) {
  return (
    <article className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-lg">
      <time
        dateTime={post?.created_at || post?.update_at || post?.updated_at}
        className="block text-sm/6 text-gray-600"
        title={post?.created_at ? moment(post.created_at).format('LL [a las] HH:mm') : ''}
      >
        {post?.created_at
          ? moment(post.created_at).fromNow()
          : moment(post?.update_at || post?.updated_at).fromNow()}
      </time>
      <h2
        id="featured-post"
        className="mt-4 text-pretty text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl"
      >
        {post?.title}
      </h2>
      <p className="mt-4 text-lg/8 text-gray-600">{post?.description}</p>
      <div className="mt-4 flex flex-col justify-between gap-6 sm:mt-8 sm:flex-row-reverse sm:gap-8 lg:mt-4 lg:flex-col">
        <div className="flex">
          <Link
            href={`/blog/post/${post?.slug}`}
            aria-describedby="featured-post"
            className="text-sm/6 font-semibold text-indigo-600"
          >
            Continue reading <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <div className="flex lg:border-t lg:border-gray-900/10 lg:pt-8">
          <Link
            href={`/@/${post?.user?.username}`}
            className="flex gap-x-2.5 text-sm/6 font-semibold text-gray-900"
          >
            {post?.user?.profile_picture ? (
              <Image
                width={512}
                height={512}
                alt={`${post?.user?.username}'s profile`}
                src={mediaUrl(post.user.profile_picture)}
                className="size-6 flex-none rounded-full bg-gray-50 object-cover"
              />
            ) : (
              <span className="size-6 flex-none rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500" aria-hidden>
                {post?.user?.username?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
            {post?.user?.username}
          </Link>
        </div>
      </div>
    </article>
  );
}