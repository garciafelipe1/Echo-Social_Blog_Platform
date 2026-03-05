import { ToastError } from '@/components/toast/toast';
import { ICategory } from '@/interfaces/blog/ICategory';
import fetchCategories, { fetchCategoriesProps } from '@/utils/api/blog/categories/list';

import { useCallback, useEffect, useState } from 'react';

export default function useCategories() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [nextUrl, setNextUrl] = useState<string>('');

  const [parentSlug, setParentSlug] = useState<string>('');
  const [ordering, setOrdering] = useState<string>('');
  const [sorting, setSorting] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [searchBy, setSearchBy] = useState<string>('');

  const listCategories = useCallback(
    async (search: string, page: number) => {
      try {
        setLoading(true);
        const fetchCategoriesData: fetchCategoriesProps = {
          parent_slug: parentSlug,
          ordering,
          sorting,
          search,
          p: page,
          page_size: pageSize,
        };
        const res = await fetchCategories(fetchCategoriesData);

        if (res.status === 200) {
          setCategories(res.results);
          setCount(res.count);
          setNextUrl(res.next);
        }
      } catch (e) {
        ToastError('Error fetching categories');
      } finally {
        setLoading(false);
      }
    },
    [ordering, pageSize, parentSlug, sorting],
  );

  useEffect(() => {
    listCategories(searchBy, currentPage);
    //eslint-disable-next-line
  }, [listCategories]);

  const onSubmitSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    listCategories(searchBy, 1);
  };

  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const loadMore = async () => {
    if (nextUrl) {
      try {
        setLoadingMore(true);

        const url = new URL(nextUrl);
        const queryParams = new URLSearchParams(url.search);

        const params: any = {};
        queryParams.forEach((value, key) => {
          params[key] = value;
        });

        const fetchCategoriesData: fetchCategoriesProps = {
          parent_slug: params.parent_slug,
          ordering: params.ordering,
          sorting: params.sorting,
          search: params.search,
          p: params.p,
          page_size: params.page_size,
        };

        const res = await fetchCategories(fetchCategoriesData);

        if (res.status === 200) {
          setCategories([...categories, ...res.results]);

          setCount(res.count);
          setNextUrl(res.next);
        }
      } catch (err) {
        ToastError('Error loading more categories');
      } finally {
        setLoadingMore(false);
      }
    }
  };

  return {
    categories,
    loading,
    count,
    onSubmitSearch,
    loadMore,
    loadingMore,
    setParentSlug,
    setOrdering,
    setSorting,
    setCurrentPage,
    setPageSize,
    setSearchBy,
  };
}
