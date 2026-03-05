/**
 * Dependency wiring: use cases receive their adapters here.
 * In tests, replace adapters with mocks.
 */

import { BlogApiAdapter } from '@/infrastructure/api';
import { ListPostsUseCase } from './use-cases';

const blogApi = new BlogApiAdapter();

export const listPostsUseCase = new ListPostsUseCase(blogApi);
