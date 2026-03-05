import buildQueryString from '@/utils/BuildQueryString';

export interface FetchAuthorPostProps {
  p: number;
  page_size: number;
}

export default async function fetchAuthorPosts(props: FetchAuthorPostProps): Promise<any> {
  try {
    const res = await fetch(`/api/blog/post/author/list/?${buildQueryString(props)}`);

    const data = await res.json();
    if (res.status === 200) {
      return data;
    }
    if (res.status === 404) {
      return data;
    }
  } catch (e) {
    return null;
  }
  return null;
}
