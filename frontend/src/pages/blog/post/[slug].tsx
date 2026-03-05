import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Layout from '@/hocs/Layout';
import PostDetail from '@/components/blog/PostDetail';
import CommentSection from '@/components/blog/CommentSection';
import { mediaUrl } from '@/utils/mediaUrl';
import { ReactElement } from 'react';
import type { IPost } from '@/interfaces/blog/IPost';

interface PageProps {
  post: IPost | null;
  canonicalUrl?: string;
}

export default function PostDetailPage({
  post,
  canonicalUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="dark:text-dark-txt-secondary text-gray-500">Post no encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} | Echo</title>
        <meta name="description" content={post.description || post.title} />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description || post.title} />
        <meta property="og:site_name" content="Echo" />
        {post.thumbnail && <meta property="og:image" content={mediaUrl(post.thumbnail)} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description || post.title} />
        {post.thumbnail && <meta name="twitter:image" content={mediaUrl(post.thumbnail)} />}
      </Head>

      <div className="mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-8">
        <PostDetail post={post} />
        <CommentSection slug={post.slug} />
      </div>
    </>
  );
}

PostDetailPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const { slug } = ctx.params as { slug: string };
  const cookie = ctx.req.headers.cookie || '';
  const proto = ctx.req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(proto) ? proto[0] : proto || 'http';
  const host = ctx.req.headers.host || 'localhost:3000';
  const canonicalUrl = `${protocol}://${host}/blog/post/${slug}`;

  try {
    const apiUrl = process.env.API_URL?.replace(/\/$/, '') || 'http://localhost:8000';
    const headers: Record<string, string> = { Accept: 'application/json' };

    const accessMatch = cookie.match(/access=([^;]+)/);
    if (accessMatch) {
      headers['Authorization'] = `JWT ${accessMatch[1]}`;
    }

    const res = await fetch(`${apiUrl}/api/blog/post/get/?slug=${encodeURIComponent(slug)}`, {
      headers,
    });

    if (!res.ok) {
      return { props: { post: null, canonicalUrl } };
    }

    const data = await res.json();
    const post: IPost = data.results ?? data;

    return { props: { post, canonicalUrl } };
  } catch {
    return { props: { post: null, canonicalUrl } };
  }
};
