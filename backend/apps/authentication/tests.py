"""Tests for authentication app."""

from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class UserAccountModelTests(TestCase):
    """Basic tests for UserAccount model."""

    def test_create_user(self):
        """Creating a user with valid data should succeed."""
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.username, "testuser")
        self.assertTrue(user.check_password("testpass123"))
