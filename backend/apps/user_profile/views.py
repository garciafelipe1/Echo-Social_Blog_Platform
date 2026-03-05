from rest_framework import permissions, status
from rest_framework_api.views import StandardAPIView, APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import datetime
from .models import UserProfile, Follow, Notification, Bookmark
from .serializers import UserProfileSerializer, NotificationSerializer
from django.core.exceptions import ValidationError
from rest_framework.response import Response

User = get_user_model()
from utils.string_utils import sanitize_string, sanitize_html, sanitize_username, sanitize_url
from rest_framework.parsers import MultiPartParser, FormParser
from apps.authentication.serializers import UserPublicSerializer
from apps.blog.models import Post
from django.shortcuts import get_object_or_404


class MyUserProfileView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        user_profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={"biography": ""},
        )
        serialized_user_profile = UserProfileSerializer(user_profile).data
        return self.response(serialized_user_profile)


class DetailUserProfileView(StandardAPIView):
    def get(self, request):
        username = request.query_params.get("username", None)
        if not username:
            return self.error("a valid username must be provided")
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return self.response("user does not exists", status=status.HTTP_404_NOT_FOUND)

        serialized_user = UserPublicSerializer(user).data

        user_profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={"biography": ""},
        )
        serialized_user_profile = UserProfileSerializer(user_profile).data

        followers_count = Follow.objects.filter(following=user).count()
        following_count = Follow.objects.filter(follower=user).count()
        posts_count = Post.postobjects.filter(user=user).count()

        is_following = False
        if request.user.is_authenticated and request.user != user:
            is_following = Follow.objects.filter(
                follower=request.user, following=user
            ).exists()

        return self.response({
            "user": serialized_user,
            "profile": serialized_user_profile,
            "followers_count": followers_count,
            "following_count": following_count,
            "posts_count": posts_count,
            "is_following": is_following,
        })


class GetMyProfilePictureView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        profile = get_object_or_404(UserProfile, user=user)
        if not profile.profile_picture:
            return Response("No profile picture found.", status=404)
        picture_url = request.build_absolute_uri(profile.profile_picture.url)
        return self.response({"profile_picture_url": picture_url})


class GetMyBannerPictureView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        profile = get_object_or_404(UserProfile, user=user)
        if not profile.profile_banner:
            return Response("No banner picture found.", status=404)
        picture_url = request.build_absolute_uri(profile.profile_banner.url)
        return self.response({"banner_picture_url": picture_url})


class UpdateUserProfileView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def put(self, request):
        user = request.user
        profile = UserProfile.objects.get(user=user)

        biography = request.data.get("biography", None)
        birthday = request.data.get("birthday", None)
        website = request.data.get("website", None)
        instagram = request.data.get("instagram", None)
        facebook = request.data.get("facebook", None)
        linkedin = request.data.get("linkedin", None)
        youtube = request.data.get("youtube", None)
        tiktok = request.data.get("tiktok", None)
        github = request.data.get("github", None)
        snapchat = request.data.get("snapchat", None)
        twitter = request.data.get("twitter", None)

        try:
            if biography:
                profile.biography = sanitize_html(biography)
            if birthday:
                try:
                    formatted_birthday = datetime.strptime(birthday, "%Y-%m-%d").date()
                    profile.birthday = formatted_birthday
                except ValueError:
                    raise ValidationError("Invalid date format. Use YYYY-MM-DD.")
            if instagram:
                profile.instagram = sanitize_url(instagram)
            if facebook:
                profile.facebook = sanitize_url(facebook)
            if linkedin:
                profile.linkedin = sanitize_url(linkedin)
            if youtube:
                profile.youtube = sanitize_url(youtube)
            if tiktok:
                profile.tiktok = sanitize_url(tiktok)
            if github:
                profile.github = sanitize_url(github)
            if website:
                profile.website = sanitize_url(website)
            if snapchat:
                profile.snapchat = sanitize_url(snapchat)
            if twitter:
                profile.twitter = sanitize_url(twitter)

            profile.save()
            return self.response("Profile has been updated successfully.")
        except ValidationError as e:
            return self.error(str(e))


class _BaseUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]
    field_name: str = ""
    success_message: str = ""

    def post(self, request):
        profile = get_object_or_404(UserProfile, user=request.user)
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"results": "No file uploaded."}, status=400)
        setattr(profile, self.field_name, uploaded_file)
        profile.save()
        return Response({"message": self.success_message}, status=200)


class UploadProfilePictureView(_BaseUploadView):
    field_name = "profile_picture"
    success_message = "Profile picture has been updated."


class UploadBannerPictureView(_BaseUploadView):
    field_name = "profile_banner"
    success_message = "Banner has been updated."


class FollowView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        from .notifications import create_notification

        username = request.data.get("username")
        if not username:
            return self.error("username is required", status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return self.error("User not found", status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return self.error("You cannot follow yourself", status=status.HTTP_400_BAD_REQUEST)

        _, created = Follow.objects.get_or_create(
            follower=request.user, following=target_user
        )
        if not created:
            return self.response("Already following")

        create_notification(
            sender=request.user,
            recipient=target_user,
            notification_type="follow",
        )

        return self.response("Followed successfully")

    def delete(self, request):
        username = request.query_params.get("username")
        if not username:
            return self.error("username is required", status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return self.error("User not found", status=status.HTTP_404_NOT_FOUND)

        deleted, _ = Follow.objects.filter(
            follower=request.user, following=target_user
        ).delete()

        if not deleted:
            return self.error("Not following this user", status=status.HTTP_400_BAD_REQUEST)

        return self.response("Unfollowed successfully")


class IsFollowingView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        username = request.query_params.get("username")
        if not username:
            return self.error("username is required", status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return self.error("User not found", status=status.HTTP_404_NOT_FOUND)

        is_following = Follow.objects.filter(
            follower=request.user, following=target_user
        ).exists()

        return self.response({"is_following": is_following})


class NotificationListView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        notifications = Notification.objects.filter(
            recipient=request.user
        ).select_related("sender", "post")[:50]
        serialized = NotificationSerializer(notifications, many=True).data
        return self.paginate(request, serialized)


class NotificationMarkReadView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        notification_ids = request.data.get("ids", [])
        if notification_ids:
            Notification.objects.filter(
                recipient=request.user, id__in=notification_ids
            ).update(is_read=True)
        else:
            Notification.objects.filter(
                recipient=request.user, is_read=False
            ).update(is_read=True)
        return self.response("Notifications marked as read")


class NotificationUnreadCountView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()
        return self.response({"unread_count": count})


class BookmarkView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        from apps.blog.serializers import PostListSerializer

        bookmarks = Bookmark.objects.filter(user=request.user).select_related(
            "post__category", "post__user"
        )
        posts = [b.post for b in bookmarks]
        serialized = PostListSerializer(posts, many=True, context={"request": request}).data
        return self.paginate(request, serialized)

    def post(self, request):
        slug = request.data.get("slug")
        if not slug:
            return self.error("slug is required", status=status.HTTP_400_BAD_REQUEST)

        try:
            post = Post.objects.get(slug=slug)
        except Post.DoesNotExist:
            return self.error("Post not found", status=status.HTTP_404_NOT_FOUND)

        _, created = Bookmark.objects.get_or_create(user=request.user, post=post)
        if not created:
            return self.response("Already bookmarked")
        return self.response("Bookmarked successfully")

    def delete(self, request):
        slug = request.query_params.get("slug")
        if not slug:
            return self.error("slug is required", status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = Bookmark.objects.filter(
            user=request.user, post__slug=slug
        ).delete()
        if not deleted:
            return self.error("Bookmark not found", status=status.HTTP_400_BAD_REQUEST)
        return self.response("Bookmark removed")
