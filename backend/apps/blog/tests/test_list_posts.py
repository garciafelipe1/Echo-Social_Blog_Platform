"""Tests for ListPostsUseCase."""

from unittest.mock import MagicMock

from django.test import TestCase

from apps.blog.application.use_cases.list_posts import ListPostsUseCase


class TestListPostsUseCase(TestCase):
    """Tests for ListPostsUseCase."""

    def setUp(self):
        self.post_repo = MagicMock()
        self.use_case = ListPostsUseCase(self.post_repo)

    def test_execute_calls_repository_with_params(self):
        """execute should call repository list_posts with correct params."""
        mock_qs = MagicMock()
        self.post_repo.list_posts.return_value = mock_qs
        result = self.use_case.execute(
            search="django",
            author_username="john",
            category_ids_or_slugs=["tech"],
            is_featured=True,
            sorting="newest",
            ordering="-created_at",
        )
        self.assertEqual(result, mock_qs)
        self.post_repo.list_posts.assert_called_once_with(
            search="django",
            author_username="john",
            category_ids_or_slugs=["tech"],
            is_featured=True,
            sorting="newest",
            ordering="-created_at",
            followed_by_user=None,
        )

    def test_execute_with_followed_by_user(self):
        """execute should pass followed_by_user to repository."""
        mock_user = MagicMock()
        mock_qs = MagicMock()
        self.post_repo.list_posts.return_value = mock_qs
        result = self.use_case.execute(followed_by_user=mock_user)
        self.post_repo.list_posts.assert_called_once()
        call_kwargs = self.post_repo.list_posts.call_args[1]
        self.assertEqual(call_kwargs["followed_by_user"], mock_user)
