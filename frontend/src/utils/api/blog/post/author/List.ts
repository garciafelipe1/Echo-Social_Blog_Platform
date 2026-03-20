import buildQueryString from '@/utils/BuildQueryString';

export interface FetchAuthorPostProps {
  p: number;
  page_size: number;
}

const EMPTY_POSTS = { results: [], count: 0, next: null };

export default async function fetchAuthorPosts(props: FetchAuthorPostProps): Promise<any> {
  try {
    const res = await fetch(`/api/blog/post/author/list/?${buildQueryString(props)}`);
    const data = await res.json();

    if (res.ok) {
      return { ...data, status: res.status };
    }
    // 400, 404, etc.: devolver lista vacía para mostrar "No tienes posts" en vez de error
    return { ...EMPTY_POSTS, status: res.status };
  } catch {
    return { ...EMPTY_POSTS, status: 0 };
  }
}
