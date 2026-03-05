"""
Ports (interfaces) for the blog domain.
Implementations live in infrastructure. Use cases depend on these abstractions.
Domain layer has no framework dependencies.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class IPostRepository(ABC):
    """Port for post persistence. Implement in infrastructure (Django ORM)."""

    @abstractmethod
    def get_by_slug(self, slug: str) -> Any:
        """Return a single post by slug or raise PostNotFoundError."""
        pass

    @abstractmethod
    def get_by_slug_and_user(self, slug: str, user: Any) -> Any:
        """Return a post by slug and owner user."""
        pass

    @abstractmethod
    def list_posts(
        self,
        *,
        search: Optional[str] = None,
        author_username: Optional[str] = None,
        category_ids_or_slugs: Optional[List[str]] = None,
        is_featured: Optional[bool] = None,
        sorting: Optional[str] = None,
        ordering: Optional[str] = None,
        followed_by_user: Optional[Any] = None,
    ) -> Any:
        """Return a queryset of published posts with optional filters and ordering."""
        pass

    @abstractmethod
    def list_posts_by_user(self, user: Any) -> Any:
        """Return all posts (including drafts) for a user."""
        pass

    @abstractmethod
    def create(self, user: Any, data: Dict[str, Any]) -> Any:
        """Create a new post. Returns the created post."""
        pass

    @abstractmethod
    def update(self, post: Any, data: Dict[str, Any]) -> Any:
        """Update an existing post. Returns the updated post."""
        pass

    @abstractmethod
    def delete(self, post: Any) -> None:
        """Delete a post."""
        pass

    @abstractmethod
    def slug_exists(self, slug: str, exclude_post_id: Optional[Any] = None) -> bool:
        """Check if a slug is already used by another post."""
        pass


class ICategoryRepository(ABC):
    """Port for category persistence."""

    @abstractmethod
    def get_by_slug(self, slug: str) -> Any:
        """Return a category by slug or raise CategoryNotFoundError."""
        pass

    @abstractmethod
    def list_categories(
        self,
        *,
        parent_slug: Optional[str] = None,
        search: Optional[str] = None,
        ordering: Optional[str] = None,
        sorting: Optional[str] = None,
    ) -> Any:
        """Return a queryset of categories with optional filters."""
        pass

    @abstractmethod
    def get_all(self) -> Any:
        """Return all categories (simple list)."""
        pass


class ICommentRepository(ABC):
    """Port for comment persistence."""

    @abstractmethod
    def create(self, user: Any, post: Any, content: str, parent: Any = None) -> Any:
        pass

    @abstractmethod
    def get_by_id(self, comment_id: str) -> Any:
        pass

    @abstractmethod
    def get_by_id_and_user(self, comment_id: str, user: Any) -> Any:
        pass

    @abstractmethod
    def list_by_post_slug(self, post_slug: str) -> Any:
        pass

    @abstractmethod
    def list_replies(self, comment_id: str) -> Any:
        pass

    @abstractmethod
    def update_content(self, comment: Any, content: str) -> Any:
        pass

    @abstractmethod
    def delete(self, comment: Any) -> None:
        pass

    @abstractmethod
    def count_active(self, post: Any) -> int:
        pass


class IInteractionRepository(ABC):
    """Port for post interactions (likes, shares, views)."""

    @abstractmethod
    def create_like(self, post: Any, user: Any) -> Any:
        pass

    @abstractmethod
    def delete_like(self, post: Any, user: Any) -> None:
        pass

    @abstractmethod
    def like_exists(self, post: Any, user: Any) -> bool:
        pass

    @abstractmethod
    def count_likes(self, post: Any) -> int:
        pass

    @abstractmethod
    def create_share(self, post: Any, user: Any, platform: str) -> Any:
        pass

    @abstractmethod
    def get_valid_platforms(self) -> list:
        pass

    @abstractmethod
    def create_interaction(self, user: Any, post: Any, interaction_type: str, ip_address: str, comment: Any = None) -> Any:
        pass

    @abstractmethod
    def get_or_create_analytics(self, post: Any) -> Any:
        pass
