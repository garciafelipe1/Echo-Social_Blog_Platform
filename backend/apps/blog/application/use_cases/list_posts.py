"""
List published posts with filters, sorting and optional cache.
Application use case: no HTTP, no serialization.
"""

from typing import Any, Optional

from apps.blog.domain import PostNotFoundError
from apps.blog.domain.ports import IPostRepository


class ListPostsUseCase:
    """List published posts with filters. Returns a queryset (or cached list)."""

    def __init__(self, post_repository: IPostRepository):
        self._post_repo = post_repository

    def execute(
        self,
        *,
        search: Optional[str] = None,
        author_username: Optional[str] = None,
        category_ids_or_slugs: Optional[list] = None,
        is_featured: Optional[bool] = None,
        sorting: Optional[str] = None,
        ordering: Optional[str] = None,
        followed_by_user: Optional[Any] = None,
    ) -> Any:
        return self._post_repo.list_posts(
            search=search or "",
            author_username=author_username,
            category_ids_or_slugs=category_ids_or_slugs,
            is_featured=is_featured,
            sorting=sorting,
            ordering=ordering,
            followed_by_user=followed_by_user,
        )
