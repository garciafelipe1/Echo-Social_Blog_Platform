"""List top-level comments for a post."""

from typing import Any

from apps.blog.domain.ports import ICommentRepository


class ListCommentsUseCase:
    def __init__(self, comment_repo: ICommentRepository):
        self._comment_repo = comment_repo

    def execute(self, post_slug: str) -> Any:
        return self._comment_repo.list_by_post_slug(post_slug)
