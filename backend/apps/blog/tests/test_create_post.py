"""Tests for CreatePostUseCase."""

from unittest.mock import MagicMock

from django.test import TestCase

from apps.blog.application.use_cases.create_post import CreatePostUseCase
from apps.blog.domain import CategoryNotFoundError, PostValidationError


class TestCreatePostUseCase(TestCase):
    """Tests for CreatePostUseCase."""

    def setUp(self):
        self.post_repo = MagicMock()
        self.category_repo = MagicMock()
        self.use_case = CreatePostUseCase(self.post_repo, self.category_repo)
        self.user = MagicMock()

    def test_execute_raises_on_missing_required_fields(self):
        """Missing required fields should raise PostValidationError."""
        data = {"title": "Test", "content": "<p>Hi</p>"}  # missing slug, category
        with self.assertRaises(PostValidationError) as ctx:
            self.use_case.execute(self.user, data)
        self.assertIn("Missing required fields", str(ctx.exception))

    def test_execute_raises_on_empty_category(self):
        """Empty category should raise PostValidationError."""
        data = {"title": "Test", "content": "<p>Hi</p>", "slug": "test-post", "category": "   "}
        with self.assertRaises(PostValidationError) as ctx:
            self.use_case.execute(self.user, data)
        self.assertIn("Category is required", str(ctx.exception))

    def test_execute_raises_on_category_not_found(self):
        """Non-existent category should raise CategoryNotFoundError."""
        self.category_repo.get_by_slug.side_effect = Exception("not found")
        data = {"title": "Test", "content": "<p>Hi</p>", "slug": "test-post", "category": "unknown"}
        with self.assertRaises(CategoryNotFoundError) as ctx:
            self.use_case.execute(self.user, data)
        self.assertIn("unknown", str(ctx.exception))

    def test_execute_raises_on_duplicate_slug(self):
        """Duplicate slug should raise PostValidationError."""
        self.category_repo.get_by_slug.return_value = MagicMock()
        self.post_repo.slug_exists.return_value = True
        data = {"title": "Test", "content": "<p>Hi</p>", "slug": "existing-slug", "category": "tech"}
        with self.assertRaises(PostValidationError) as ctx:
            self.use_case.execute(self.user, data)
        self.assertIn("already exists", str(ctx.exception))

    def test_execute_returns_post_on_success(self):
        """Valid data should create and return post."""
        self.category_repo.get_by_slug.return_value = MagicMock()
        self.post_repo.slug_exists.return_value = False
        mock_post = MagicMock()
        self.post_repo.create.return_value = mock_post
        data = {
            "title": "Test Post",
            "content": "<p>Content</p>",
            "slug": "test-post",
            "category": "tech",
            "description": "Desc",
            "keywords": "key",
        }
        result = self.use_case.execute(self.user, data)
        self.assertEqual(result, mock_post)
        self.post_repo.create.assert_called_once()
