"""Share a post on a given platform."""

from typing import Any, Optional

from apps.blog.domain.ports import IPostRepository, IInteractionRepository


class SharePostUseCase:
    def __init__(
        self,
        post_repo: IPostRepository,
        interaction_repo: IInteractionRepository,
    ):
        self._post_repo = post_repo
        self._interaction_repo = interaction_repo

    def execute(
        self,
        post_slug: str,
        platform: str,
        ip_address: str,
        user: Optional[Any] = None,
    ) -> dict:
        post = self._post_repo.get_by_slug(post_slug)

        valid = self._interaction_repo.get_valid_platforms()
        if platform not in valid:
            raise ValueError(f"Invalid platform. Valid options: {', '.join(valid)}")

        self._interaction_repo.create_share(post, user, platform)
        self._interaction_repo.create_interaction(
            user=user, post=post, interaction_type="share", ip_address=ip_address,
        )
        analytics = self._interaction_repo.get_or_create_analytics(post)
        analytics.increment_metric("shares")

        return {"post_title": post.title, "platform": platform}
