"""
Domain exceptions. Represent business rule violations or domain errors.
They do not depend on Django or any framework.
"""


class BlogDomainError(Exception):
    """Base exception for blog domain errors."""

    pass


class PostNotFoundError(BlogDomainError):
    """Raised when a post is not found (e.g. by slug)."""

    def __init__(self, identifier: str):
        self.identifier = identifier
        super().__init__(f"Post not found: {identifier}")


class CategoryNotFoundError(BlogDomainError):
    """Raised when a category is not found."""

    def __init__(self, identifier: str):
        self.identifier = identifier
        super().__init__(f"Category not found: {identifier}")


class PostPermissionError(BlogDomainError):
    """Raised when the user is not allowed to perform the action on the post."""

    pass


class PostValidationError(BlogDomainError):
    """Raised when post data fails domain validation (e.g. duplicate slug)."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)
