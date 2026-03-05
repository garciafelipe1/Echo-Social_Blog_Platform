"""
Delete a post. Only the owner can delete. Returns nothing; caller invalidates caches.
"""

from typing import Any

from apps.blog.domain import PostNotFoundError, PostPermissionError
from apps.blog.domain.ports import IPostRepository


class DeletePostUseCase:
    def __init__(self, post_repository: IPostRepository):
        self._post_repo = post_repository

    def execute(self, user: Any, post_slug: str) -> None:
        if getattr(user, "role", None) == "customer":
            raise PostPermissionError()

        post = self._post_repo.get_by_slug_and_user(post_slug, user)
        if post is None:
            raise PostNotFoundError(post_slug)

        self._post_repo.delete(post)
