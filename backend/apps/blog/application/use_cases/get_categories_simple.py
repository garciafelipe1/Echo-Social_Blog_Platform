"""
Get all categories (simple list, no filters). Used for dropdowns and simple lists.
"""

from apps.blog.domain.ports import ICategoryRepository


class GetCategoriesSimpleUseCase:
    def __init__(self, category_repository: ICategoryRepository):
        self._category_repo = category_repository

    def execute(self):
        return self._category_repo.get_all()
