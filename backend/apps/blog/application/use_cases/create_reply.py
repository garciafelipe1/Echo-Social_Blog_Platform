"""Create a reply to an existing comment."""

from typing import Any

from apps.blog.domain.ports import ICommentRepository, IInteractionRepository


class CreateReplyUseCase:
    def __init__(
        self,
        comment_repo: ICommentRepository,
        interaction_repo: IInteractionRepository,
    ):
        self._comment_repo = comment_repo
        self._interaction_repo = interaction_repo

    def execute(self, user: Any, comment_id: str, content: str, ip_address: str) -> Any:
        parent = self._comment_repo.get_by_id(comment_id)
        reply = self._comment_repo.create(
            user=user, post=parent.post, content=content, parent=parent,
        )

        self._interaction_repo.create_interaction(
            user=user, post=parent.post, interaction_type="comment",
            ip_address=ip_address, comment=reply,
        )
        analytics = self._interaction_repo.get_or_create_analytics(parent.post)
        analytics.increment_metric("comments")

        return reply
