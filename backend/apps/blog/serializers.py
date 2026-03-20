from rest_framework import serializers
from apps.authentication.serializers import UserPublicSerializer
from .models import (
    Post,
    Category,
    Heading,
    PostView,
    PostInteraccion,
    Comment,
    PostLike,
    PostShare,
    CategoryAnalytics,
    PostAnalytics
)



class CategorySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Category
        fields = "__all__"

class CategoryListSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Category
        fields = [
            "name",
            "slug",
            "children",
            # "thumbnail"
        ]
    def get_children(self, obj):
        # Obtener las categorías hijas de la categoría actual
        children = Category.objects.filter(parent=obj)
        return CategorySerializer(children, many=True).data

class CategoryAnalyticsSerializer(serializers.ModelSerializer):
    category_name= serializers.SerializerMethodField()
    
    class Meta:
        model=CategoryAnalytics
        fields=[
            "id",
            "category_name",
            "views",
            "impressions",
            "clicks",
            "click_through_rate",
            "avg_time_on_page",
        ]
        
    def get_category_name(self,obj):
        return obj.category.name
    
class HeadingSerializer(serializers.ModelSerializer):
    class Meta:
        model=Heading
        fields= [
            "title",
            "slug",
            "level",
            "order",
        ]

class  PostViewSerializer(serializers.ModelSerializer):
    
    class Meta:
        model=PostView
        fields= "__all__"
        
class PostSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    headings = HeadingSerializer(many=True)
    view_count = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    user = UserPublicSerializer(read_only=True)
    
    
    class Meta:
        model=Post
        fields= "__all__"
    
    def get_view_count(self, obj):
        """Solo vistas únicas (abrir detalle), no impresiones en listado."""
        try:
            analytics = obj.post_analytics
            return analytics.views
        except Exception:
            return 0
    
    def get_comments_count(self,obj):
        return obj.post_comments.filter(parent=None,is_active=True).count()
    
    def get_likes_count(self,obj):
        return obj.likes.filter().count()
    
    def get_has_liked(self,obj):
        
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return PostLike.objects.filter(post=obj,user=user).exists()
        
        return False
        
 
class RecentCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'username', 'content', 'created_at']


class PostListSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    view_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    recent_comments = serializers.SerializerMethodField()
    user = UserPublicSerializer()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "description",
            "thumbnail",
            "slug",
            "category",
            "view_count",
            "likes_count",
            "has_liked",
            "comments_count",
            "recent_comments",
            "update_at",
            "created_at",
            "featured",
            "user",
        ]

    def get_view_count(self, obj):
        """Solo vistas únicas (abrir detalle), no impresiones en listado."""
        try:
            analytics = obj.post_analytics
            return analytics.views
        except PostAnalytics.DoesNotExist:
            return 0

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_has_liked(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return PostLike.objects.filter(post=obj, user=request.user).exists()
        return False

    def get_comments_count(self, obj):
        return obj.post_comments.filter(parent=None, is_active=True).count()

    def get_recent_comments(self, obj):
        comments = obj.post_comments.filter(
            parent=None, is_active=True
        ).select_related('user').order_by('-created_at')[:2]
        return RecentCommentSerializer(comments, many=True).data


class PostAnalyticsSerializer(serializers.ModelSerializer):
    
    post_title= serializers.SerializerMethodField()
    class Meta:
        model=PostAnalytics
        fields=[
            "id",
            "post_title",
            "impressions",
            "clicks",
            "click_through_rate",
            "avg_time_on_page",
            "views",
            "likes",
            "comments",
            "shares",
        ]
    def get_post_title(self,obj):
        return obj.post.title

class PostInteraccionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    post_title= serializers.SerializerMethodField()
    
    
    def get_post_title(self,obj):
        return obj.post.title
    
    def get_comment_content(self,obj):
        return obj.comment.content if obj.comment else None 
    
    class Meta:
        model=PostInteraccion
        fields=[
            "id",
            "user",
            "post_title",
            "interaction_type",
            "interaction_category",
            "weight",
            "timestamp",
            "device_type",
            "ip_address",
            "hour_of_day",
            "day_of_week",
            "comment_content",
        ]

class CommentSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    post_title = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "post",
            "post_title",
            "parent",
            "content",
            "created_at",
            "update_at",
            "is_active",
            "replies_count",
        ]

    def get_post_title(self, obj):
        return obj.post.title

    def get_replies_count(self, obj):
        return obj.replies.filter(is_active=True).count()



class PostLikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    
    class Meta:
        model=PostLike
        fields=[
            "id",
            "post",
            "user",
            "timestapm",
        ]


        
class PostShareSerializer(serializers.ModelSerializer):
    
    user = serializers.StringRelatedField()
    
    class Meta:
        model=PostShare
        fields=[
            "id",
            "post",
            "user",
            "plataform",
            "timestapm",
        ]


   






