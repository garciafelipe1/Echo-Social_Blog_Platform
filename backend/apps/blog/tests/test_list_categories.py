"""Tests for ListCategoriesUseCase."""

from unittest.mock import MagicMock

from django.test import TestCase

from apps.blog.application.use_cases.list_categories import ListCategoriesUseCase


class TestListCategoriesUseCase(TestCase):
    """Tests for ListCategoriesUseCase."""

    def setUp(self):
        self.category_repo = MagicMock()
        self.use_case = ListCategoriesUseCase(self.category_repo)

    def test_execute_calls_repository_with_params(self):
        """execute should call repository with correct params."""
        mock_qs = MagicMock()
        self.category_repo.list_categories.return_value = mock_qs
        result = self.use_case.execute(
            parent_slug="tech",
            search="python",
            ordering="name",
            sorting="az",
        )
        self.assertEqual(result, mock_qs)
        self.category_repo.list_categories.assert_called_once_with(
            parent_slug="tech",
            search="python",
            ordering="name",
            sorting="az",
        )

    def test_execute_passes_empty_search_when_none(self):
        """execute should pass empty string for search when None."""
        mock_qs = MagicMock()
        self.category_repo.list_categories.return_value = mock_qs
        self.use_case.execute()
        call_kwargs = self.category_repo.list_categories.call_args[1]
        self.assertEqual(call_kwargs["search"], "")
