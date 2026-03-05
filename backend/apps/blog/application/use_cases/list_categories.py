"""
List categories with optional filters and pagination support.
"""

from typing import Any, Optional

from apps.blog.domain.ports import ICategoryRepository


class ListCategoriesUseCase:
    def __init__(self, category_repository: ICategoryRepository):
        self._category_repo = category_repository

    def execute(
        self,
        *,
        parent_slug: Optional[str] = None,
        search: Optional[str] = None,
        ordering: Optional[str] = None,
        sorting: Optional[str] = None,
    ) -> Any:
        return self._category_repo.list_categories(
            parent_slug=parent_slug,
            search=search or "",
            ordering=ordering,
            sorting=sorting,
        )
