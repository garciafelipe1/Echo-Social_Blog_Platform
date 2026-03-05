"""Domain exceptions for authentication. No Django dependency."""


class AuthenticationDomainError(Exception):
    """Base for authentication domain errors."""
    pass


class UserNotFoundError(AuthenticationDomainError):
    """Raised when a user is not found."""
    pass


class InvalidCredentialsError(AuthenticationDomainError):
    """Raised when credentials are invalid."""
    pass
