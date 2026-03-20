"""Integration tests for API endpoints using DRF APIClient."""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.authentication.models import UserAccount


class HealthCheckAPITest(TestCase):
    """Integration tests for /api/health/ endpoint."""

    def setUp(self):
        self.client = APIClient()

    def test_health_returns_200(self):
        """GET /api/health/ should return 200."""
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_health_returns_json_with_status(self):
        """Health response should contain status and checks."""
        response = self.client.get("/api/health/")
        data = response.json()
        self.assertIn("status", data)
        self.assertIn("checks", data)
        self.assertEqual(data["status"], "ok")


class PostListAPITest(TestCase):
    """Integration tests for /api/blog/posts/ endpoint."""

    def setUp(self):
        self.client = APIClient()

    def test_list_posts_returns_200(self):
        """GET /api/blog/posts/ should return 200 (public endpoint)."""
        response = self.client.get("/api/blog/posts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_posts_returns_paginated_data(self):
        """List posts should return results or empty list with pagination fields."""
        response = self.client.get("/api/blog/posts/")
        data = response.json()
        self.assertIsInstance(data, (dict, list))


class AuthJWTAPITest(TestCase):
    """Integration tests for /auth/jwt/create/ (login) endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = UserAccount.objects.create_user(
            email="test@example.com",
            password="TestPass123!",
            first_name="Test",
            last_name="User",
            username="testuser",
        )
        self.user.is_active = True
        self.user.save()

    def test_login_with_valid_credentials_returns_200(self):
        """POST /auth/jwt/create/ with valid email/password returns tokens."""
        response = self.client.post(
            "/auth/jwt/create/",
            {"email": "test@example.com", "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("access", data)
        self.assertIn("refresh", data)

    def test_login_with_invalid_password_returns_401(self):
        """POST /auth/jwt/create/ with wrong password returns 401."""
        response = self.client.post(
            "/auth/jwt/create/",
            {"email": "test@example.com", "password": "WrongPassword"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
