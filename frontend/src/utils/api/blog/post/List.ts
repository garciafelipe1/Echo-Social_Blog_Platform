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

export default async function fetchPosts(props: FetchPostProps): Promise<any> {
  try {
    const res = await fetch(`/api/blog/post/list/?${buildQueryString(props)}`);

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
