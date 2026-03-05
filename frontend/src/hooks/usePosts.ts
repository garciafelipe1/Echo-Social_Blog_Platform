import { ToastError, ToastSuccess } from '@/components/toast/toast';
import { IPostsList } from '@/interfaces/blog/IPost';
import deletePost from '@/utils/api/blog/post/author/delete';
import { listPostsUseCase } from '@/application/container';
import { useCallback, useEffect, useState } from 'react';

interface ComponentProps {
  username?: string;
  showFeatured?: boolean;
  feed?: string;
  category?: string;
}

export default function usePosts({ username, showFeatured, feed, category }: ComponentProps) {
  const [posts, setPosts] = useState<IPostsList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [nextUrl, setNextUrl] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [ordering, setOrdering] = useState<string>('');
  const [sorting, setSorting] = useState<string>('');
  const [searchBy, setSearchBy] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState<boolean>(showFeatured || false);
  const [author, setAuthor] = useState<string>(username || '');

  const listPosts = useCallback(
    async (page: number, search: string) => {
      try {
        setLoading(true);
        const res = await listPostsUseCase.execute({
          p: page,
          page_size: pageSize,
          ordering,
          sorting,
          search,
          author,
          ...(showFeatured !== undefined && { is_featured: showFeatured }),
          ...(feed && { feed }),
          ...(category && { categories: [category] }),
        });
        if (res) {
          setPosts((res.results as IPostsList[]) || []);
          setCount(res.count ?? 0);
          setNextUrl(res.next ?? '');
        }
      } catch (err) {
        ToastError('error fetching posts');
      } finally {
        setLoading(false);
      }
    },
    [pageSize, ordering, sorting, author, showFeatured, feed, category],
  );

  useEffect(() => {
    listPosts(currentPage, searchBy);
  }, [listPosts, currentPage, searchBy]);
  const onSubmitSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    listPosts(1, searchBy);
  };

  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const loadMore = async () => {
    if (!nextUrl) return;
    try {
      setLoadingMore(true);
      const url = new URL(nextUrl);
      const queryParams = new URLSearchParams(url.search);
      const params: Record<string, string> = {};
      queryParams.forEach((value, key) => {
        params[key] = value;
      });
      const res = await listPostsUseCase.execute({
        p: Number(params.p) || 1,
        page_size: Number(params.page_size) || pageSize,
        ...(showFeatured !== undefined && { is_featured: showFeatured }),
      });
      if (res) {
        setPosts((prev) => [...prev, ...((res.results as IPostsList[]) || [])]);
        setCount(res.count ?? 0);
        setNextUrl(res.next ?? '');
      }
    } catch (err) {
      ToastError('Error fetching posts');
    } finally {
      setLoadingMore(false);
    }
  };

  const [loadingDelete, setLoadingDelete] = useState(false);
  const handleDelete = async (slug: string) => {
    try {
      setLoadingDelete(true);
      const res = await deletePost({ slug });
      if (res.status === 200) {
        ToastSuccess('post deleted successfully');
        setPosts((prevPosts) => prevPosts.filter((post) => post.slug !== slug));
      }
    } catch (err) {
      ToastError('error deleting post');
    } finally {
      setLoadingDelete(false);
    }
  };

  const refetch = useCallback(() => {
    listPosts(1, searchBy);
  }, [listPosts, searchBy]);

  return {
    posts,
    count,
    loading,
    loadingMore,
    nextUrl,
    loadingDelete,
    pageSize,
    currentPage,
    ordering,
    sorting,
    searchBy,
    handleDelete,
    setCurrentPage,
    setPageSize,
    setOrdering,
    setSorting,
    setSearchBy,
    setAuthor,
    loadMore,
    onSubmitSearch,
    setIsFeatured,
    refetch,
  };
}
