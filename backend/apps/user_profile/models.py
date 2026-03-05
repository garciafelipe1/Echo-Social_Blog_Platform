from django.db import models
import uuid
from django.conf import settings
from ckeditor.fields import RichTextField
from djoser.signals import user_registered, user_activated


User = settings.AUTH_USER_MODEL


class UserProfile(models.Model):
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    profile_banner = models.ImageField(upload_to='profile_banners/', null=True, blank=True)

    biography = RichTextField()
    birthday = models.DateField(null=True, blank=True)

    website = models.URLField(blank=True, default='')
    facebook = models.URLField(blank=True, default='')
    twitter = models.URLField(blank=True, default='')
    instagram = models.URLField(blank=True, default='')
    github = models.URLField(blank=True, default='')
    linkedin = models.URLField(blank=True, default='')
    youtube = models.URLField(blank=True, default='')
    tiktok = models.URLField(blank=True, default='')
    snapchat = models.URLField(blank=True, default='')


class Follow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="following_set"
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="followers_set"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")
        indexes = [
            models.Index(fields=["follower"]),
            models.Index(fields=["following"]),
        ]

    def __str__(self):
        return f"{self.follower} -> {self.following}"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("like", "Like"),
        ("comment", "Comment"),
        ("reply", "Reply"),
        ("follow", "Follow"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_notifications"
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    post = models.ForeignKey(
        "blog.Post", on_delete=models.CASCADE, null=True, blank=True
    )
    comment = models.ForeignKey(
        "blog.Comment", on_delete=models.CASCADE, null=True, blank=True
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "-created_at"]),
            models.Index(fields=["recipient", "is_read"]),
        ]

    def __str__(self):
        return f"{self.sender} -> {self.recipient}: {self.notification_type}"


class Bookmark(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookmarks"
    )
    post = models.ForeignKey("blog.Post", on_delete=models.CASCADE, related_name="bookmarked_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "post")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} -> {self.post}"


def post_user_activated(user, *args, **kwargs):
    if not UserProfile.objects.filter(user=user).exists():
        UserProfile.objects.create(user=user)


user_activated.connect(post_user_activated)
