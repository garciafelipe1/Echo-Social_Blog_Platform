import CustomTabs from '@/components/CustomTabs';
import CreatePost from '@/components/pages/blog/CreatePost';
import ListPosts from '@/components/pages/blog/ListPosts';
import Layout from '@/hocs/Layout';
import useCategories from '@/hooks/useCategories';

import usePosts from '@/hooks/usePosts';
import usePostsAuthor from '@/hooks/usePostsAuthor';
import useFollow from '@/hooks/useFollow';

import { IProfile } from '@/interfaces/auth/IProfile';
import { IUser } from '@/interfaces/auth/IUser';
import { RootState } from '@/redux/reducers';
import SanitizeContent from '@/utils/SanitizeContent';
import { mediaUrl } from '@/utils/mediaUrl';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ReactElement, useState } from 'react';
import { useSelector } from 'react-redux';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { slug } = context.params as { slug: string };

  let user: IUser | null = null;
  let profile: IProfile | null = null;
  let followersCount = 0;
  let followingCount = 0;
  let postsCount = 0;
  let isFollowingInitial = false;

  try {
    const cookie = context.req.headers.cookie || '';
    const headers: Record<string, string> = { Accept: 'application/json' };
    const accessMatch = cookie.match(/access=([^;]+)/);
    if (accessMatch) {
      headers['Authorization'] = `JWT ${accessMatch[1]}`;
    }

    const apiRes = await fetch(`${process.env.API_URL}/api/profile/get/?username=${slug}`, {
      headers,
    });
    const data = await apiRes.json();
    if (apiRes.status === 200) {
      user = data.results.user;
      profile = data.results.profile;
      followersCount = data.results.followers_count ?? 0;
      followingCount = data.results.following_count ?? 0;
      postsCount = data.results.posts_count ?? 0;
      isFollowingInitial = data.results.is_following ?? false;
    }
  } catch {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user,
      profile,
      followersCount,
      followingCount,
      postsCount,
      isFollowingInitial,
    },
  };
};

function CreatePostContent() {
  return <div key={1}>Create Post</div>;
}

export default function Page({
  profile,
  user,
  followersCount,
  followingCount,
  postsCount,
  isFollowingInitial,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const myUser = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const {
    isFollowing,
    toggle: toggleFollow,
    loading: followLoading,
  } = useFollow({
    username: user?.username || '',
    initialFollowing: isFollowingInitial ?? false,
  });

  const social = [
    {
      name: 'URL',
      href: profile?.website,
      icon: <GlobeAltIcon className="h-5 w-5" />,
    },
    {
      name: 'Facebook',
      href: profile?.facebook,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: profile?.twitter,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
    {
      name: 'Github',
      href: profile?.github,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: profile?.instagram,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: profile?.linkedin,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: 'Tiktok',
      href: profile?.tiktok,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
    {
      name: 'Youtube',
      href: profile?.youtube,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 01-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 011.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'Snapchat',
      href: profile?.snapchat,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.97-.27.09-.03.21-.075.36-.075.27 0 .54.135.654.395.06.12.09.27.09.42 0 .3-.12.585-.345.765a3.4 3.4 0 01-1.29.585c-.09.03-.18.045-.27.075-.09.015-.18.045-.27.075-.12.045-.18.075-.255.135-.09.075-.15.18-.18.315 0 .06-.015.135-.015.21.075.12.18.24.3.345.24.21.525.39.81.555.225.12.45.225.675.315.285.135.405.195.585.285.15.09.27.18.345.315.135.21.135.48.015.705-.165.315-.48.48-.825.57-.285.06-.585.09-.87.09-.15 0-.285-.015-.42-.03a4.69 4.69 0 01-.465-.06c-.135-.03-.3-.075-.465-.15-.09-.03-.195-.06-.3-.075-.09 0-.195.015-.27.045-.27.105-.495.315-.735.48-.3.21-.63.42-1.02.585C13.32 23.07 12.39 23.4 12 23.4c-.39 0-1.32-.33-2.415-1.065-.39-.165-.72-.375-1.02-.585-.24-.165-.465-.375-.735-.48-.075-.03-.18-.045-.27-.045-.105.015-.21.045-.3.075-.165.075-.33.12-.465.15-.15.03-.3.045-.465.06-.135.015-.27.03-.42.03-.285 0-.585-.03-.87-.09-.345-.09-.66-.255-.825-.57-.12-.225-.12-.495.015-.705.075-.135.195-.225.345-.315.18-.09.3-.15.585-.285.225-.09.45-.195.675-.315.285-.165.57-.345.81-.555.12-.105.225-.225.3-.345 0-.075-.015-.15-.015-.21-.03-.135-.09-.24-.18-.315-.075-.06-.135-.09-.255-.135-.09-.03-.18-.06-.27-.075-.09-.03-.18-.045-.27-.075a3.4 3.4 0 01-1.29-.585c-.225-.18-.345-.465-.345-.765 0-.15.03-.3.09-.42.114-.26.385-.395.654-.395.15 0 .27.045.36.075.311.15.67.254.97.27.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C5.447 1.069 8.807.793 9.797.793h2.409z" />
        </svg>
      ),
    },
  ];

  const sanitizedBio = SanitizeContent(profile?.biography);
  const [isExpand, setIsExpand] = useState<boolean>(false);
  const toggleExpanded = () => {
    setIsExpand(!isExpand);
  };
  const biographyPreview = sanitizedBio.slice(0, 600);
  const isCustomer = user?.role === 'customer';
  const isOwner = myUser?.username === user?.username;

  const { categories, loading: loadingCategories } = useCategories();

  // Enlistar nuestros posts si estamos en nuestro perfil
  const {
    posts: authorPosts,
    loading: loadingAuthorPosts,
    loading: loadingMoreAuthorPosts,
    loadMore: loadMoreAuthorPosts,
  } = usePostsAuthor({ isOwner });

  // Enlistar los posts de alguien más
  const authorHook = usePostsAuthor({ isOwner });
  const otherUserHook = usePosts({ username: user?.username });

  const { posts, loading, loadingMore, loadMore, nextUrl, handleDelete, loadingDelete } = isOwner
    ? authorHook
    : otherUserHook;

  return (
    <div>
      {profile?.profile_banner ? (
        <Image
          className="h-32 w-full object-cover sm:h-48 lg:h-64"
          src={mediaUrl(profile.profile_banner)}
          width={1200}
          height={400}
          alt=""
          priority
        />
      ) : (
        <div className="dark:bg-dark-second h-32 w-full bg-gray-200 sm:h-48 lg:h-64" aria-hidden />
      )}
      <div className="mx-auto max-w-5xl px-3 pb-20 sm:px-6 lg:px-8">
        <div className="relative z-10 -mt-12">
          {/* Avatar + actions row */}
          <div className="flex items-end justify-between">
            <div className="flex">
              {profile?.profile_picture ? (
                <Image
                  width={512}
                  height={512}
                  className="dark:bg-dark-bg dark:border-dark-border dark:border-dark-main h-20 w-20 rounded-full border-4 border-white bg-white object-cover sm:h-32 sm:w-32"
                  src={mediaUrl(profile.profile_picture)}
                  alt=""
                />
              ) : (
                <div
                  className="dark:bg-dark-bg dark:border-dark-border dark:border-dark-main flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gray-200 text-2xl text-gray-500 sm:h-32 sm:w-32"
                  aria-hidden
                >
                  {user?.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pb-1">
              {isOwner ? (
                <Link
                  href="/profile"
                  className="dark:border-dark-border dark:text-dark-txt dark:hover:bg-dark-second rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
                >
                  Editar perfil
                </Link>
              ) : isAuthenticated ? (
                <button
                  type="button"
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                    isFollowing
                      ? 'dark:border-dark-border dark:text-dark-txt border border-gray-300 text-gray-900 hover:border-red-300 hover:text-red-600'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              ) : null}
            </div>
          </div>

          {/* Name + stats */}
          <div className="mt-3">
            <div className="flex items-center gap-1">
              <h2 className="text-xl font-bold sm:text-2xl">{user?.username}</h2>
              <CheckBadgeIcon className="h-5 w-auto text-green-500" />
            </div>
            <div className="dark:text-dark-txt-secondary mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>
                <strong className="dark:text-dark-txt text-gray-900">{postsCount ?? 0}</strong>{' '}
                posts
              </span>
              <span>
                <strong className="dark:text-dark-txt text-gray-900">{followersCount ?? 0}</strong>{' '}
                seguidores
              </span>
              <span>
                <strong className="dark:text-dark-txt text-gray-900">{followingCount ?? 0}</strong>{' '}
                siguiendo
              </span>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-3 flex flex-wrap gap-2">
            {social?.map((item) => {
              if (item.href && item.href.trim() !== '') {
                return (
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    key={item?.name}
                    href={item?.href}
                    className="dark:hover:bg-dark-second dark:hover:text-dark-txt rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    {item?.icon}
                  </Link>
                );
              }
              return null;
            })}
          </div>
        </div>
        {sanitizedBio && (
          <div className="relative mt-4 pb-2">
            <p
              className="dark:text-dark-txt-secondary text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: isExpand ? sanitizedBio : biographyPreview }}
            />
            {sanitizedBio.length > 600 && (
              <>
                {!isExpand && (
                  <div className="dark:from-dark-main absolute bottom-0 h-16 w-full bg-gradient-to-t from-white" />
                )}
                <button
                  onClick={toggleExpanded}
                  type="button"
                  className="relative z-10 mt-1 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
                >
                  {isExpand ? 'Ver menos' : 'Ver mas'}
                </button>
              </>
            )}
          </div>
        )}
        <div className="mt-4">
          <CustomTabs
            titles={isOwner && !isCustomer ? ['Posts', 'Crear post'] : ['Posts']}
            panels={
              isOwner && !isCustomer
                ? [
                    <div className="mt-4" key={1}>
                      <ListPosts
                        loading={loading}
                        key={1}
                        posts={posts}
                        loadingMore={loadingMore}
                        nextUrl={nextUrl}
                        loadMore={loadMore}
                        handleDelete={handleDelete}
                        loadingDelete={loadingDelete}
                      />
                    </div>,
                    <div className="p-3 sm:p-4" key={2}>
                      <CreatePost categories={categories} loadingCategories={loadingCategories} />
                    </div>,
                  ]
                : [
                    <div className="mt-4" key={1}>
                      <ListPosts
                        key={1}
                        posts={posts}
                        loadingMore={loadingMore}
                        nextUrl={nextUrl}
                        loadMore={loadMore}
                        handleDelete={handleDelete}
                        loadingDelete={loadingDelete}
                      />
                    </div>,
                  ]
            }
            width="w-full"
          />
        </div>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
