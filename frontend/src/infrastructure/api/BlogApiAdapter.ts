/**
 * Infrastructure: adapter that implements IBlogApiPort using fetch (Next.js API routes).
 */

import buildQueryString from '@/utils/BuildQueryString';
import { fetchWithRetry } from '@/utils/fetchWithRetry';
import type { IBlogApiPort, FetchPostListParams, PostListResult } from '@/application/ports/blog';

export class BlogApiAdapter implements IBlogApiPort {
  async fetchPostList(params: FetchPostListParams): Promise<PostListResult | null> {
    try {
      const res = await fetchWithRetry(`/api/blog/post/list/?${buildQueryString(params)}`, {
        maxRetries: 2,
        retryOn: (r) => r.status >= 500,
      });
      const data = (await res.json()) as PostListResult;
      if (res.ok) return data;
      // 404, 400, etc.: devolver lista vacía para mensaje amigable
      return { results: [], count: 0, next: null, previous: null };
    } catch {
      return { results: [], count: 0, next: null, previous: null };
    }
  }

  async fetchPostBySlug(slug: string): Promise<unknown | null> {
    try {
      const res = await fetchWithRetry(`/api/blog/post/get/?slug=${encodeURIComponent(slug)}`, {
        maxRetries: 2,
        retryOn: (r) => r.status >= 500,
      });
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
