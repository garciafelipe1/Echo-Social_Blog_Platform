"""
Get a single published post by slug.
"""

from apps.blog.domain import PostNotFoundError
from apps.blog.domain.ports import IPostRepository


class GetPostBySlugUseCase:
    def __init__(self, post_repository: IPostRepository):
        self._post_repo = post_repository

    def execute(self, slug: str):
        if not slug:
            raise ValueError("Slug parameter must be provided")
        post = self._post_repo.get_by_slug(slug)
        if post is None:
            raise PostNotFoundError(slug)
        return post
