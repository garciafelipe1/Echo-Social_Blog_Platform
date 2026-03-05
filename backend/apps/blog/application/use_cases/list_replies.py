"""List replies for a comment."""

from typing import Any

from apps.blog.domain.ports import ICommentRepository


class ListRepliesUseCase:
    def __init__(self, comment_repo: ICommentRepository):
        self._comment_repo = comment_repo

    def execute(self, comment_id: str) -> Any:
        return self._comment_repo.list_replies(comment_id)
