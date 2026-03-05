"""Create a comment on a post."""

from typing import Any

from apps.blog.domain.ports import IPostRepository, ICommentRepository, IInteractionRepository


class CreateCommentUseCase:
    def __init__(
        self,
        post_repo: IPostRepository,
        comment_repo: ICommentRepository,
        interaction_repo: IInteractionRepository,
    ):
        self._post_repo = post_repo
        self._comment_repo = comment_repo
        self._interaction_repo = interaction_repo

    def execute(self, user: Any, post_slug: str, content: str, ip_address: str) -> Any:
        post = self._post_repo.get_by_slug(post_slug)
        comment = self._comment_repo.create(user=user, post=post, content=content)

        self._interaction_repo.create_interaction(
            user=user, post=post, interaction_type="comment",
            ip_address=ip_address, comment=comment,
        )
        analytics = self._interaction_repo.get_or_create_analytics(post)
        analytics.increment_metric("comments")

        return comment
