"""Tests for GetPostBySlugUseCase."""

from unittest.mock import MagicMock

from django.test import TestCase

from apps.blog.application.use_cases.get_post_by_slug import GetPostBySlugUseCase
from apps.blog.domain import PostNotFoundError


class TestGetPostBySlugUseCase(TestCase):
    """Tests for GetPostBySlugUseCase."""

    def setUp(self):
        self.post_repo = MagicMock()
        self.use_case = GetPostBySlugUseCase(self.post_repo)

    def test_execute_raises_on_empty_slug(self):
        """Empty slug should raise ValueError."""
        with self.assertRaises(ValueError) as ctx:
            self.use_case.execute("")
        self.assertIn("Slug", str(ctx.exception))

        with self.assertRaises(ValueError):
            self.use_case.execute(None)

    def test_execute_raises_on_none_slug(self):
        """None slug should raise ValueError."""
        with self.assertRaises(ValueError):
            self.use_case.execute(None)

    def test_execute_returns_post_on_success(self):
        """Valid slug should return post from repository."""
        mock_post = MagicMock()
        self.post_repo.get_by_slug.return_value = mock_post
        result = self.use_case.execute("my-post-slug")
        self.assertEqual(result, mock_post)
        self.post_repo.get_by_slug.assert_called_once_with("my-post-slug")

    def test_execute_propagates_post_not_found(self):
        """PostNotFoundError from repo should propagate."""
        self.post_repo.get_by_slug.side_effect = PostNotFoundError("missing")
        with self.assertRaises(PostNotFoundError):
            self.use_case.execute("missing-post")
