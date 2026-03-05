/**
 * Infrastructure: adapter that implements IBlogApiPort using fetch (Next.js API routes).
 */

import buildQueryString from '@/utils/BuildQueryString';
import type { IBlogApiPort, FetchPostListParams, PostListResult } from '@/application/ports/blog';

export class BlogApiAdapter implements IBlogApiPort {
  async fetchPostList(params: FetchPostListParams): Promise<PostListResult | null> {
    try {
      const res = await fetch(`/api/blog/post/list/?${buildQueryString(params)}`);
      const data = await res.json();
      if (res.status === 200) return data as PostListResult;
      if (res.status === 404) return data as PostListResult;
    } catch {
      return null;
    }
    return null;
  }

  async fetchPostBySlug(slug: string): Promise<unknown | null> {
    try {
      const res = await fetch(`/api/blog/post/get/?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (res.ok) return data;
    } catch {
      return null;
    }
    return null;
  }

  async fetchCategories(): Promise<unknown[]> {
    try {
      const res = await fetch('/api/blog/categories/list_all');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) return data;
    } catch {
      return [];
    }
    return [];
  }
}
