"""Tests for ToggleLikeUseCase."""

from unittest.mock import MagicMock

from django.test import TestCase

from apps.blog.application.use_cases.toggle_like import ToggleLikeUseCase


class TestToggleLikeUseCase(TestCase):
    """Tests for ToggleLikeUseCase."""

    def setUp(self):
        self.post_repo = MagicMock()
        self.interaction_repo = MagicMock()
        self.use_case = ToggleLikeUseCase(self.post_repo, self.interaction_repo)
        self.user = MagicMock()
        self.mock_post = MagicMock()
        self.mock_post.title = "Test Post"

    def test_like_raises_when_already_liked(self):
        """like() should raise ValueError when user already liked."""
        self.post_repo.get_by_slug.return_value = self.mock_post
        self.interaction_repo.like_exists.return_value = True
        with self.assertRaises(ValueError) as ctx:
            self.use_case.like(self.user, "test-post", "127.0.0.1")
        self.assertIn("already liked", str(ctx.exception))

    def test_like_creates_like_on_success(self):
        """like() should create like and return post title."""
        self.post_repo.get_by_slug.return_value = self.mock_post
        self.interaction_repo.like_exists.return_value = False
        mock_analytics = MagicMock()
        self.interaction_repo.get_or_create_analytics.return_value = mock_analytics
        result = self.use_case.like(self.user, "test-post", "127.0.0.1")
        self.assertEqual(result["post_title"], "Test Post")
        self.interaction_repo.create_like.assert_called_once_with(self.mock_post, self.user)
        mock_analytics.increment_metric.assert_called_with("likes")

    def test_unlike_raises_when_not_liked(self):
        """unlike() should raise ValueError when user has not liked."""
        self.post_repo.get_by_slug.return_value = self.mock_post
        self.interaction_repo.like_exists.return_value = False
        with self.assertRaises(ValueError) as ctx:
            self.use_case.unlike(self.user, "test-post")
        self.assertIn("not liked", str(ctx.exception))

    def test_unlike_removes_like_on_success(self):
        """unlike() should delete like and update analytics."""
        self.post_repo.get_by_slug.return_value = self.mock_post
        self.interaction_repo.like_exists.return_value = True
        self.interaction_repo.count_likes.return_value = 4
        mock_analytics = MagicMock()
        self.interaction_repo.get_or_create_analytics.return_value = mock_analytics
        result = self.use_case.unlike(self.user, "test-post")
        self.assertEqual(result["post_title"], "Test Post")
        self.interaction_repo.delete_like.assert_called_once_with(self.mock_post, self.user)
