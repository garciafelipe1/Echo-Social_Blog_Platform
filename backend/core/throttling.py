"""Custom throttle classes for sensitive endpoints."""

from rest_framework.throttling import UserRateThrottle


class CreatePostRateThrottle(UserRateThrottle):
    """Limit post creation to 20/min per user."""
    rate = "20/min"
    scope = "create"


class AuthRateThrottle(UserRateThrottle):
    """Stricter limit for auth-related endpoints (login, register, OTP)."""
    rate = "10/min"
    scope = "auth"
