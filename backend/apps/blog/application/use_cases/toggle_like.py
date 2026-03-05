"""Toggle like on a post (like or unlike)."""

from typing import Any

from apps.blog.domain.ports import IPostRepository, IInteractionRepository


class ToggleLikeUseCase:
    def __init__(
        self,
        post_repo: IPostRepository,
        interaction_repo: IInteractionRepository,
    ):
        self._post_repo = post_repo
        self._interaction_repo = interaction_repo

    def like(self, user: Any, post_slug: str, ip_address: str) -> dict:
        post = self._post_repo.get_by_slug(post_slug)

        if self._interaction_repo.like_exists(post, user):
            raise ValueError("You have already liked this post")

        self._interaction_repo.create_like(post, user)
        self._interaction_repo.create_interaction(
            user=user, post=post, interaction_type="like", ip_address=ip_address,
        )
        analytics = self._interaction_repo.get_or_create_analytics(post)
        analytics.increment_metric("likes")

        return {"post_title": post.title}

    def unlike(self, user: Any, post_slug: str) -> dict:
        post = self._post_repo.get_by_slug(post_slug)

        if not self._interaction_repo.like_exists(post, user):
            raise ValueError("You have not liked this post")

        self._interaction_repo.delete_like(post, user)
        analytics = self._interaction_repo.get_or_create_analytics(post)
        analytics.likes = self._interaction_repo.count_likes(post)
        analytics.save()

        return {"post_title": post.title}
