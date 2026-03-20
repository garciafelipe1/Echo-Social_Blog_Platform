"""Tests for UpdatePostUseCase."""

from unittest.mock import MagicMock

from django.test import TestCase

from apps.blog.application.use_cases.update_post import UpdatePostUseCase
from apps.blog.domain import CategoryNotFoundError, PostNotFoundError, PostValidationError


class TestUpdatePostUseCase(TestCase):
    """Tests for UpdatePostUseCase."""

    def setUp(self):
        self.post_repo = MagicMock()
        self.category_repo = MagicMock()
        self.use_case = UpdatePostUseCase(self.post_repo, self.category_repo)
        self.user = MagicMock()

    def test_execute_raises_when_post_not_found(self):
        """PostNotFoundError when post does not exist for user."""
        self.post_repo.get_by_slug_and_user.side_effect = PostNotFoundError("missing")
        with self.assertRaises(PostNotFoundError):
            self.use_case.execute(self.user, "missing-post", {"title": "New"})

    def test_execute_raises_on_duplicate_slug(self):
        """PostValidationError when new slug already exists for another post."""
        mock_post = MagicMock()
        mock_post.id = "post-123"
        self.post_repo.get_by_slug_and_user.return_value = mock_post
        self.post_repo.slug_exists.return_value = True
        with self.assertRaises(PostValidationError) as ctx:
            self.use_case.execute(self.user, "my-post", {"slug": "taken-slug"})
        self.assertIn("already exists", str(ctx.exception))

    def test_execute_raises_on_invalid_category(self):
        """CategoryNotFoundError when category slug does not exist."""
        mock_post = MagicMock()
        self.post_repo.get_by_slug_and_user.return_value = mock_post
        self.post_repo.slug_exists.return_value = False
        self.category_repo.get_by_slug.side_effect = Exception("not found")
        with self.assertRaises(CategoryNotFoundError) as ctx:
            self.use_case.execute(self.user, "my-post", {"category": "unknown"})
        self.assertIn("unknown", str(ctx.exception))

    def test_execute_returns_updated_post_on_success(self):
        """Valid data should update and return post."""
        mock_post = MagicMock()
        self.post_repo.get_by_slug_and_user.return_value = mock_post
        self.post_repo.slug_exists.return_value = False
        self.post_repo.update.return_value = mock_post
        result = self.use_case.execute(
            self.user, "my-post",
            {"title": "Updated", "content": "<p>New</p>"}
        )
        self.assertEqual(result, mock_post)
        self.post_repo.update.assert_called_once()
