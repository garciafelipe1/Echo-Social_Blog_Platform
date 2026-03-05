"""
Utility to create notifications and push them via Channels.
Call from use cases or views after actions like like, comment, follow.
"""

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification


def create_notification(*, sender, recipient, notification_type, post=None, comment=None):
    """Create a Notification record and push via WebSocket if channel layer is available."""
    if sender == recipient:
        return None

    notification = Notification.objects.create(
        sender=sender,
        recipient=recipient,
        notification_type=notification_type,
        post=post,
        comment=comment,
    )

    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"notifications_{recipient.id}",
                {
                    "type": "notification.message",
                    "data": {
                        "id": str(notification.id),
                        "notification_type": notification_type,
                        "sender_username": sender.username,
                        "sender_name": f"{sender.first_name} {sender.last_name}".strip(),
                        "post_title": post.title if post else None,
                        "post_slug": post.slug if post else None,
                        "created_at": notification.created_at.isoformat(),
                    },
                },
            )
    except Exception:
        pass

    return notification
