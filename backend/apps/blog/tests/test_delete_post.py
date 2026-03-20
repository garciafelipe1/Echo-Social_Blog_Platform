"""Tests for DeletePostUseCase."""

from unittest.mock import MagicMock

from django.test import TestCase

from apps.blog.application.use_cases.delete_post import DeletePostUseCase
from apps.blog.domain import PostNotFoundError


class TestDeletePostUseCase(TestCase):
    """Tests for DeletePostUseCase."""

    def setUp(self):
        self.post_repo = MagicMock()
        self.use_case = DeletePostUseCase(self.post_repo)
        self.user = MagicMock()

    def test_execute_raises_when_post_not_found(self):
        """PostNotFoundError when post does not exist for user."""
        self.post_repo.get_by_slug_and_user.side_effect = PostNotFoundError("missing")
        with self.assertRaises(PostNotFoundError):
            self.use_case.execute(self.user, "missing-post")

    def test_execute_raises_when_post_is_none(self):
        """PostNotFoundError when repo returns None (post not owned by user)."""
        self.post_repo.get_by_slug_and_user.return_value = None
        with self.assertRaises(PostNotFoundError):
            self.use_case.execute(self.user, "other-user-post")

    def test_execute_deletes_post_on_success(self):
        """Valid post should be deleted."""
        mock_post = MagicMock()
        self.post_repo.get_by_slug_and_user.return_value = mock_post
        self.use_case.execute(self.user, "my-post")
        self.post_repo.get_by_slug_and_user.assert_called_once_with("my-post", self.user)
        self.post_repo.delete.assert_called_once_with(mock_post)
