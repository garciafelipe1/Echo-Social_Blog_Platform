import { ToastError } from '@/components/toast/toast';
import { ICategoryList } from '@/interfaces/blog/ICategory';
import fetchAllCategories from '@/utils/api/blog/categories/listPostCategories';
import { useCallback, useEffect, useState } from 'react';

export default function usePostCategories() {
  const [categories, setCategories] = useState<ICategoryList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const listCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAllCategories();

      if (res && Array.isArray(res.results)) {
        setCategories(res.results);
      } else if (res && Array.isArray(res)) {
        setCategories(res);
      } else if (res && typeof res === 'object' && !Array.isArray(res)) {
        setCategories([]);
      } else {
        setCategories([]);
      }
    } catch (error) {
      ToastError('Error loading categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listCategories();
  }, [listCategories]);

  return {
    categories,
    loading,
  };
}
