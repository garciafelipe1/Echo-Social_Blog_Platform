/**
 * Application use case: list posts with filters.
 * Depends only on the port (IBlogApiPort); infrastructure provides the implementation.
 */

import type { IBlogApiPort, FetchPostListParams, PostListResult } from '../ports/blog';

export class ListPostsUseCase {
  constructor(private readonly api: IBlogApiPort) {}

  async execute(params: FetchPostListParams): Promise<PostListResult | null> {
    return this.api.fetchPostList(params);
  }
}
