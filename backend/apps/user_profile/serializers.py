from rest_framework import serializers
from .models import UserProfile, Notification
from apps.authentication.serializers import UserPublicSerializer


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'profile_picture',
            'profile_banner',
            'biography',
            'birthday',
            'website',
            'facebook',
            'twitter',
            'instagram',
            'github',
            'linkedin',
            'youtube',
            'tiktok',
            'snapchat',
        ]


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)
    post_title = serializers.SerializerMethodField()
    post_slug = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'sender',
            'notification_type',
            'post_title',
            'post_slug',
            'is_read',
            'created_at',
        ]

    def get_post_title(self, obj):
        return obj.post.title if obj.post else None

    def get_post_slug(self, obj):
        return obj.post.slug if obj.post else None