"""
Django ORM implementations of domain repository ports.
"""

import uuid
from typing import Any, Dict, List, Optional

from django.db.models import Q, F, Value
from django.db.models.functions import Coalesce
from django.db.models import Prefetch

from apps.blog.domain.exceptions import PostNotFoundError, CategoryNotFoundError
from apps.blog.domain.ports import IPostRepository, ICategoryRepository, ICommentRepository, IInteractionRepository
from apps.blog.models import (
    Post,
    Category,
    Heading,
    Comment,
    PostLike,
    PostShare,
    PostInteraccion,
    PostAnalytics,
)
from django.utils.text import slugify
from bs4 import BeautifulSoup
from utils.string_utils import sanitize_string, sanitize_html


class DjangoPostRepository(IPostRepository):
    """Post repository implemented with Django ORM."""

    def get_by_slug(self, slug: str) -> Any:
        try:
            return Post.objects.select_related("category", "user").prefetch_related(
                "headings"
            ).get(slug=slug)
        except Post.DoesNotExist:
            raise PostNotFoundError(slug)

    def get_by_slug_and_user(self, slug: str, user: Any) -> Any:
        try:
            return Post.objects.get(slug=slug, user=user)
        except Post.DoesNotExist:
            raise PostNotFoundError(slug)

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
        qs = (
            Post.postobjects.all()
            .select_related("category", "user")
            .annotate(
                analytics_views=Coalesce(F("post_analytics__views"), Value(0)),
                analytics_likes=Coalesce(F("post_analytics__likes"), Value(0)),
                analytics_comments=Coalesce(F("post_analytics__comments"), Value(0)),
                analytics_shares=Coalesce(F("post_analytics__shares"), Value(0)),
            )
        )
        if author_username:
            qs = qs.filter(user__username=author_username)
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(content__icontains=search)
                | Q(keywords__icontains=search)
                | Q(category__name__icontains=search)
            )
        if category_ids_or_slugs:
            category_q = Q()
            for c in category_ids_or_slugs:
                try:
                    uuid.UUID(c)
                    category_q |= Q(category__id=c)
                except ValueError:
                    category_q |= Q(category__slug=c)
            qs = qs.filter(category_q)
        if is_featured is not None:
            qs = qs.filter(featured=is_featured)
        if followed_by_user:
            from apps.user_profile.models import Follow
            following_ids = Follow.objects.filter(
                follower=followed_by_user
            ).values_list("following_id", flat=True)
            qs = qs.filter(user_id__in=following_ids)
        if sorting:
            if sorting == "newest":
                qs = qs.order_by("-created_at")
            elif sorting == "az":
                qs = qs.order_by("title")
            elif sorting == "za":
                qs = qs.order_by("-title")
            elif sorting == "recently_updated":
                qs = qs.order_by("-update_at")
            elif sorting == "most_viewed":
                qs = qs.order_by("-analytics_views")
        return qs

    def list_posts_by_user(self, user: Any) -> Any:
        return Post.objects.filter(user=user).select_related("category", "user")

    def _extract_post_data(self, data: Dict[str, Any], user: Any) -> Dict[str, Any]:
        """Build model fields from use case data (already sanitized by use case if needed)."""
        title = sanitize_string(data.get("title", ""))
        description = sanitize_string(data.get("description", ""))
        content = sanitize_html(data.get("content", ""))
        status = sanitize_string(data.get("status", "draft"))
        keywords = sanitize_string(data.get("keywords", ""))
        slug = slugify(data.get("slug", ""))
        category = data.get("category")  # may be already resolved (model instance)
        if category is None:
            raise ValueError("category is required")
        thumbnail = data.get("thumbnail")
        return {
            "user": user,
            "title": title,
            "description": description,
            "content": content,
            "status": status,
            "keywords": keywords,
            "slug": slug,
            "category": category,
            "thumbnail": thumbnail,
        }

    def _sync_headings(self, post: Post, content: str) -> None:
        Heading.objects.filter(post=post).delete()
        soup = BeautifulSoup(content, "html.parser")
        headings = soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])
        for order, heading in enumerate(headings, start=1):
            level = int(heading.name[1])
            Heading.objects.create(
                post=post,
                title=heading.get_text(strip=True),
                slug=slugify(heading.get_text(strip=True)),
                level=level,
                order=order,
            )

    def create(self, user: Any, data: Dict[str, Any]) -> Any:
        category_slug = (data.get("category") or "").strip().lower()
        category = self._category_repo.get_by_slug(category_slug)
        data["category"] = category
        fields = self._extract_post_data(data, user)
        post = Post.objects.create(**fields)
        self._sync_headings(post, fields["content"])
        return post

    def update(self, post: Any, data: Dict[str, Any]) -> Any:
        if "title" in data:
            post.title = sanitize_string(data["title"])
        if "description" in data:
            post.description = sanitize_string(data["description"])
        if "content" in data:
            post.content = sanitize_html(data["content"])
            self._sync_headings(post, post.content)
        if "status" in data:
            post.status = sanitize_string(data["status"])
        if "keywords" in data:
            post.keywords = sanitize_string(data["keywords"])
        if "slug" in data:
            post.slug = slugify(data["slug"])
        if "thumbnail" in data and data["thumbnail"]:
            post.thumbnail = data["thumbnail"]
        if "category" in data:
            post.category = data["category"]
        post.save()
        return post

    def delete(self, post: Any) -> None:
        post.delete()

    def slug_exists(self, slug: str, exclude_post_id: Optional[Any] = None) -> bool:
        qs = Post.objects.filter(slug=slug)
        if exclude_post_id is not None:
            qs = qs.exclude(id=exclude_post_id)
        return qs.exists()

    def __init__(self, category_repository: Optional[ICategoryRepository] = None):
        self._category_repo = category_repository or DjangoCategoryRepository()


class DjangoCategoryRepository(ICategoryRepository):
    """Category repository implemented with Django ORM."""

    def get_by_slug(self, slug: str) -> Any:
        try:
            return Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            raise CategoryNotFoundError(slug)

    def list_categories(
        self,
        *,
        parent_slug: Optional[str] = None,
        search: Optional[str] = None,
        ordering: Optional[str] = None,
        sorting: Optional[str] = None,
    ) -> Any:
        if parent_slug:
            qs = Category.objects.filter(parent__slug=parent_slug).prefetch_related(
                Prefetch("category_analytics", to_attr="analytics_cache")
            )
        else:
            qs = Category.objects.filter(parent__isnull=True).prefetch_related(
                Prefetch("category_analytics", to_attr="analytics_cache")
            )
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(slug__icontains=search)
                | Q(title__icontains=search)
                | Q(description__icontains=search)
            )
        if sorting == "newest" and hasattr(Category, "created_at"):
            qs = qs.order_by("-created_at")
        elif sorting == "recently_updated" and hasattr(Category, "updated_at"):
            qs = qs.order_by("-updated_at")
        elif sorting == "most_viewed":
            qs = qs.annotate(popularity=F("category_analytics__views")).order_by(
                "-popularity"
            )
        if ordering == "az":
            qs = qs.order_by("name")
        elif ordering == "za":
            qs = qs.order_by("-name")
        return qs

    def get_all(self) -> Any:
        return Category.objects.all()


class DjangoCommentRepository(ICommentRepository):
    """Comment repository implemented with Django ORM."""

    def create(self, user: Any, post: Any, content: str, parent: Any = None) -> Any:
        return Comment.objects.create(
            user=user,
            post=post,
            content=content,
            parent=parent,
        )

    def get_by_id(self, comment_id: str) -> Any:
        try:
            return Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            raise PostNotFoundError(f"Comment {comment_id}")

    def get_by_id_and_user(self, comment_id: str, user: Any) -> Any:
        try:
            return Comment.objects.get(id=comment_id, user=user)
        except Comment.DoesNotExist:
            raise PostNotFoundError(f"Comment {comment_id}")

    def list_by_post_slug(self, post_slug: str) -> Any:
        return Comment.objects.filter(post__slug=post_slug, parent=None)

    def list_replies(self, comment_id: str) -> Any:
        parent = self.get_by_id(comment_id)
        return parent.replies.filter(is_active=True).order_by("-created_at")

    def update_content(self, comment: Any, content: str) -> Any:
        comment.content = content
        comment.save()
        return comment

    def delete(self, comment: Any) -> None:
        comment.delete()

    def count_active(self, post: Any) -> int:
        return Comment.objects.filter(post=post, is_active=True).count()


class DjangoInteractionRepository(IInteractionRepository):
    """Interaction repository for likes, shares, and analytics."""

    def create_like(self, post: Any, user: Any) -> Any:
        return PostLike.objects.create(post=post, user=user)

    def delete_like(self, post: Any, user: Any) -> None:
        PostLike.objects.get(post=post, user=user).delete()

    def like_exists(self, post: Any, user: Any) -> bool:
        return PostLike.objects.filter(post=post, user=user).exists()

    def count_likes(self, post: Any) -> int:
        return PostLike.objects.filter(post=post).count()

    def create_share(self, post: Any, user: Any, platform: str) -> Any:
        return PostShare.objects.create(post=post, user=user, plataform=platform)

    def get_valid_platforms(self) -> list:
        return [choice[0] for choice in PostShare._meta.get_field("plataform").choices]

    def create_interaction(self, user: Any, post: Any, interaction_type: str, ip_address: str, comment: Any = None) -> Any:
        return PostInteraccion.objects.create(
            user=user,
            post=post,
            interaction_type=interaction_type,
            ip_address=ip_address,
            comment=comment,
        )

    def get_or_create_analytics(self, post: Any) -> Any:
        analytics, _ = PostAnalytics.objects.get_or_create(post=post)
        return analytics
