import buildQueryString from '@/utils/BuildQueryString';

export interface FetchPostProps {
  p: number;
  page_size: number;
  search?: string;
  sorting?: string;
  ordering?: string;
  author?: string;
  is_featured?: boolean;

  // categories?:string
}

const EMPTY_POSTS = { results: [], count: 0, next: null };

export default async function fetchPosts(props: FetchPostProps): Promise<any> {
  try {
    const res = await fetch(`/api/blog/post/list/?${buildQueryString(props)}`);
    const data = await res.json();

    if (res.ok) {
      return { ...data, status: res.status };
    }
    // 404, 400, etc.: devolver lista vacía para mostrar mensaje amigable en vez de error
    return { ...EMPTY_POSTS, ...data, results: data?.results ?? [], status: res.status };
  } catch {
    return { ...EMPTY_POSTS, status: 0 };
  }
}
