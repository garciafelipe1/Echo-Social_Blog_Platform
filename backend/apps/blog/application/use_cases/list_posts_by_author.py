"""
List all posts (including drafts) for the authenticated author.
Cualquier usuario autenticado puede ver sus propios posts.
"""

from typing import Any

from apps.blog.domain.ports import IPostRepository


class ListPostsByAuthorUseCase:
    def __init__(self, post_repository: IPostRepository):
        self._post_repo = post_repository

    def execute(self, user: Any):
        return self._post_repo.list_posts_by_user(user)
