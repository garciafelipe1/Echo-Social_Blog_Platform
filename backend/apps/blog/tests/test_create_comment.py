"""Tests for CreateCommentUseCase."""

from unittest.mock import MagicMock

from django.test import TestCase

from apps.blog.application.use_cases.create_comment import CreateCommentUseCase


class TestCreateCommentUseCase(TestCase):
    """Tests for CreateCommentUseCase."""

    def setUp(self):
        self.post_repo = MagicMock()
        self.comment_repo = MagicMock()
        self.interaction_repo = MagicMock()
        self.use_case = CreateCommentUseCase(
            self.post_repo, self.comment_repo, self.interaction_repo
        )
        self.user = MagicMock()
        self.mock_post = MagicMock()
        self.mock_comment = MagicMock()

    def test_execute_creates_comment_and_updates_analytics(self):
        """execute should create comment and increment analytics."""
        self.post_repo.get_by_slug.return_value = self.mock_post
        self.comment_repo.create.return_value = self.mock_comment
        mock_analytics = MagicMock()
        self.interaction_repo.get_or_create_analytics.return_value = mock_analytics

        result = self.use_case.execute(
            self.user, "test-post", "<p>Great post!</p>", "127.0.0.1"
        )

        self.assertEqual(result, self.mock_comment)
        self.post_repo.get_by_slug.assert_called_once_with("test-post")
        self.comment_repo.create.assert_called_once_with(
            user=self.user, post=self.mock_post, content="<p>Great post!</p>"
        )
        mock_analytics.increment_metric.assert_called_with("comments")
