"""
Create a new post. Validates required fields and slug uniqueness.
Cualquier usuario autenticado puede crear posts.
"""

from typing import Any, Dict

from apps.blog.domain import CategoryNotFoundError, PostValidationError
from apps.blog.domain.ports import IPostRepository, ICategoryRepository


class CreatePostUseCase:
    def __init__(
        self,
        post_repository: IPostRepository,
        category_repository: ICategoryRepository,
    ):
        self._post_repo = post_repository
        self._category_repo = category_repository

    def execute(self, user: Any, data: Dict[str, Any]) -> Any:
        required = ["title", "content", "slug", "category"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            raise PostValidationError(f"Missing required fields: {', '.join(missing)}")

        category_slug = (data.get("category") or "").strip().lower()
        if not category_slug:
            raise PostValidationError("Category is required")
        try:
            category = self._category_repo.get_by_slug(category_slug)
        except Exception:
            raise CategoryNotFoundError(category_slug)

        if self._post_repo.slug_exists(data.get("slug", "").strip()):
            raise PostValidationError(f"The slug '{data.get('slug')}' already exists.")

        return self._post_repo.create(user, data)
