"""Tests for SharePostUseCase and PostShare functionality."""

import pytest
from unittest.mock import MagicMock
from apps.blog.application.use_cases.share_post import SharePostUseCase


@pytest.mark.django_db
class TestSharePostUseCase:
    """Tests for SharePostUseCase."""

    def test_execute_raises_on_invalid_platform(self):
        """Share with invalid platform should raise ValueError."""
        post_repo = MagicMock()
        interaction_repo = MagicMock()
        interaction_repo.get_valid_platforms.return_value = ["twitter", "facebook", "other"]

        use_case = SharePostUseCase(post_repo, interaction_repo)

        with pytest.raises(ValueError, match="Invalid platform"):
            use_case.execute(
                post_slug="test-post",
                platform="invalid_platform",
                ip_address="127.0.0.1",
            )
