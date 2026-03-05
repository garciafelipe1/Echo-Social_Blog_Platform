"""Tests for SharePostUseCase and PostShare functionality."""

from unittest.mock import MagicMock

from django.test import TestCase

from apps.blog.application.use_cases.share_post import SharePostUseCase


class TestSharePostUseCase(TestCase):
    """Tests for SharePostUseCase."""

    def test_execute_raises_on_invalid_platform(self):
        """Share with invalid platform should raise ValueError."""
        post_repo = MagicMock()
        interaction_repo = MagicMock()
        interaction_repo.get_valid_platforms.return_value = ["twitter", "facebook", "other"]

        use_case = SharePostUseCase(post_repo, interaction_repo)

        with self.assertRaises(ValueError) as ctx:
            use_case.execute(
                post_slug="test-post",
                platform="invalid_platform",
                ip_address="127.0.0.1",
            )
        self.assertIn("Invalid platform", str(ctx.exception))
