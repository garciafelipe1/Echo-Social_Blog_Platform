/**
 * Ports (interfaces) for blog use cases.
 * Implemented by infrastructure (API client). Use cases depend on these.
 */

export interface FetchPostListParams {
  p: number;
  page_size: number;
  search?: string;
  sorting?: string;
  ordering?: string;
  author?: string;
  is_featured?: boolean;
  categories?: string[];
  feed?: string;
}

export interface PostListResult {
  results: unknown[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface IBlogApiPort {
  fetchPostList(params: FetchPostListParams): Promise<PostListResult | null>;
  fetchPostBySlug(slug: string): Promise<unknown | null>;
  fetchCategories(): Promise<unknown[]>;
}
