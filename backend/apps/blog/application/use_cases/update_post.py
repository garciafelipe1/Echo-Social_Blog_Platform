"""
Update an existing post. Only the owner can update.
Cualquier usuario autenticado puede editar sus propios posts.
"""

from typing import Any, Dict

from apps.blog.domain import (
    CategoryNotFoundError,
    PostNotFoundError,
    PostValidationError,
)
from apps.blog.domain.ports import IPostRepository, ICategoryRepository


class UpdatePostUseCase:
    def __init__(
        self,
        post_repository: IPostRepository,
        category_repository: ICategoryRepository,
    ):
        self._post_repo = post_repository
        self._category_repo = category_repository

    def execute(self, user: Any, post_slug: str, data: Dict[str, Any]) -> Any:
        post = self._post_repo.get_by_slug_and_user(post_slug, user)
        if post is None:
            raise PostNotFoundError(post_slug)

        slug = (data.get("slug") or "").strip()
        if slug and self._post_repo.slug_exists(slug, exclude_post_id=post.id):
            raise PostValidationError(f"The slug '{slug}' already exists for another post.")

        category_slug = (data.get("category") or "").strip().lower()
        if category_slug:
            try:
                category = self._category_repo.get_by_slug(category_slug)
            except Exception:
                raise CategoryNotFoundError(category_slug)
            data["category"] = category

        return self._post_repo.update(post, data)
