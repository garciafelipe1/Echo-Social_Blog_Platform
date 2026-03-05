"""Domain exceptions for user profile."""


class ProfileDomainError(Exception):
    pass


class ProfileNotFoundError(ProfileDomainError):
    """Raised when a profile is not found."""
    pass
