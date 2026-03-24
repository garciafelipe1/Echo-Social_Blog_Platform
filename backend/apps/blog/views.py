from rest_framework_api.views import StandardAPIView, APIView
from core.throttling import CreatePostRateThrottle
from rest_framework.exceptions import NotFound, APIException, ValidationError
from django.conf import settings
from django.core.cache import cache
from rest_framework import permissions
from rest_framework import status

import redis

from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import (
    Post,
    Heading,
    PostAnalytics,
    Category,
    CategoryAnalytics,
    PostView,
    PostInteraccion,
)
from .serializers import (
    PostSerializer,
    PostListSerializer,
    HeadingSerializer,
    CategoryListSerializer,
    CommentSerializer,
)
from .utils import get_client_ip
from django.db.models import Prefetch
from apps.authentication.models import UserAccount
from faker import Faker
from utils.string_utils import sanitize_string, sanitize_html

import random
import uuid
from datetime import timedelta
from urllib.request import urlopen
from django.utils import timezone
from django.core.files.base import ContentFile
from django.utils.text import slugify
from rest_framework.pagination import PageNumberPagination

# Clean Architecture: use cases and domain exceptions
from .api.dependencies import (
    get_categories_simple_use_case,
    get_post_by_slug_use_case,
    list_posts_by_author_use_case,
    list_posts_use_case,
    create_post_use_case,
    update_post_use_case,
    delete_post_use_case,
    list_categories_use_case,
    create_comment_use_case,
    list_comments_use_case,
    create_reply_use_case,
    list_replies_use_case,
    toggle_like_use_case,
    share_post_use_case,
)
from .domain import (
    PostNotFoundError,
    CategoryNotFoundError,
    PostPermissionError,
    PostValidationError,
)

# Cliente Redis opcional: si no está disponible (ej. desarrollo sin Redis), no se usan impresiones
try:
    redis_client = redis.Redis(host=settings.REDIS_HOST, port=6379, db=0) if getattr(settings, "USE_REDIS", True) else None
except Exception:
    redis_client = None


def _safe_redis_incr(key):
    if redis_client is None:
        return
    try:
        redis_client.incr(key)
    except Exception:
        pass


def _bulk_increment_impressions(post_ids, request=None):
    """
    Increment impressions only for posts the viewer hasn't seen yet.
    Uses Django cache for dedup (24h TTL). If cache is unavailable, skips dedup
    but still counts the impression.
    """
    if not post_ids:
        return

    from django.db.models import F

    viewer_id = None
    if request:
        try:
            if hasattr(request, "user") and request.user.is_authenticated:
                viewer_id = f"u:{request.user.id}"
            else:
                viewer_id = f"ip:{get_client_ip(request)}"
        except Exception:
            pass

    new_post_ids = list(post_ids)

    if viewer_id:
        try:
            already_seen = set()
            cache_keys = {str(pid): f"seen:{pid}:{viewer_id}" for pid in post_ids}
            cached = cache.get_many(list(cache_keys.values()))
            for pid, key in cache_keys.items():
                if cached.get(key):
                    already_seen.add(pid)

            new_post_ids = [pid for pid in post_ids if str(pid) not in already_seen]

            if new_post_ids:
                to_cache = {f"seen:{pid}:{viewer_id}": 1 for pid in new_post_ids}
                cache.set_many(to_cache, timeout=86400)
        except Exception:
            new_post_ids = list(post_ids)

    try:
        if new_post_ids:
            PostAnalytics.objects.filter(post_id__in=new_post_ids).update(
                impressions=F("impressions") + 1
            )
    except Exception:
        pass


class CategoriesListView(StandardAPIView):
    """Simple list of all categories (e.g. for dropdowns). Use case: GetCategoriesSimpleUseCase."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = get_categories_simple_use_case.execute()
        serialized_categories = CategoryListSerializer(categories, many=True).data
        return self.response(serialized_categories)


class DetailPostView(StandardAPIView):
    """Get a single post by slug. Use case: GetPostBySlugUseCase. Registra vista única (1 por usuario/post)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        slug = request.query_params.get("slug", None)
        try:
            post = get_post_by_slug_use_case.execute(slug)
        except (ValueError, PostNotFoundError) as e:
            raise NotFound(detail=str(e))
        # Registrar vista única: 1 por usuario (o IP si anónimo), sin incrementar en recargas
        ip_address = get_client_ip(request)
        user = request.user if request.user.is_authenticated else None
        self._register_view_once(post, ip_address, user)
        serialized_post = PostSerializer(post, context={"request": request}).data
        return self.response(serialized_post)

    def _register_view_once(self, post, ip_address, user):
        """Solo cuenta 1 vista por usuario/post (o por IP si anónimo). Recargas no incrementan."""
        if user:
            exists = PostView.objects.filter(post=post, user=user).exists()
        else:
            exists = PostView.objects.filter(post=post, ip_address=ip_address, user__isnull=True).exists()
        if not exists:
            PostView.objects.create(post=post, ip_address=ip_address, user=user)
            # El signal post_save de PostView ya incrementa analytics.views
class PostAuthorViews(StandardAPIView):
    """CRUD for posts by the authenticated author. Use cases: List/Create/Update/Delete."""
    permission_classes = [permissions.IsAuthenticated]

    def get_throttles(self):
        if self.request.method == "POST":
            return [CreatePostRateThrottle()]
        return super().get_throttles()

    def get(self, request):
        try:
            posts = list_posts_by_author_use_case.execute(request.user)
        except PostPermissionError:
            return self.error("You do not have permission to create post")
        if not posts.exists():
            raise NotFound(detail="No posts found")
        serialized_post = PostListSerializer(posts, many=True, context={'request': request}).data
        return self.paginate(request, serialized_post)


    def put(self, request):
        post_slug = request.data.get("post_slug")
        if not post_slug:
            return self.error("Missing post_slug", status=400)
        data = {
            "title": request.data.get("title"),
            "description": request.data.get("description"),
            "content": request.data.get("content"),
            "status": request.data.get("status", "draft"),
            "keywords": request.data.get("keywords", ""),
            "slug": request.data.get("slug"),
            "category": request.data.get("category"),
            "thumbnail": request.FILES.get("thumbnail"),
        }
        try:
            post = update_post_use_case.execute(request.user, post_slug, data)
        except PostPermissionError:
            return self.error("You do not have permission to edit post")
        except PostNotFoundError:
            raise NotFound(detail=f"Post '{post_slug}' does not exist.")
        except CategoryNotFoundError as e:
            return self.error(str(e), status=400)
        except PostValidationError as e:
            return self.error(str(e), status=400)
        serialized_post = PostSerializer(post, context={"request": request}).data
        return self.response(serialized_post)
       
      
    def post(self, request):
        data = {
            "title": request.data.get("title"),
            "description": request.data.get("description"),
            "content": request.data.get("content"),
            "status": request.data.get("status", "draft"),
            "slug": request.data.get("slug"),
            "category": request.data.get("category"),
            "keywords": request.data.get("keywords", ""),
            "thumbnail": request.FILES.get("thumbnail"),
        }
        try:
            post = create_post_use_case.execute(request.user, data)
        except PostPermissionError:
            return self.error("You do not have permission to create post")
        except CategoryNotFoundError as e:
            return self.error(str(e), status=400)
        except PostValidationError as e:
            return self.error(str(e), status=400)
        except Exception as e:
            return self.error(f"Error al crear el post: {str(e)}", status=400)
        self._invalidate_author_posts_cache(request.user.username)
        self._invalidate_post_list_cache()
        return self.response(f"Post '{post.title}' created successfully", status=status.HTTP_201_CREATED)
    
    
    def delete(self, request):
        post_slug = request.query_params.get("slug", None)
        if not post_slug:
            raise NotFound(detail="Post slug must be provided")
        try:
            delete_post_use_case.execute(request.user, post_slug)
        except PostPermissionError:
            return self.error("You do not have permission to delete post")
        except PostNotFoundError:
            raise NotFound(detail=f"Post {post_slug} does not exist.")
        self._invalidate_post_list_cache()
        self._invalidate_post_detail_cache(post_slug)
        self._invalidate_author_posts_cache(request.user.username)
        return self.response("Post deleted successfully")
    
    def _invalidate_author_posts_cache(self, username: str):
        """Invalida la caché de posts del autor para que aparezcan al instante."""
        try:
            cache_keys = cache.keys(f"author_posts:{username}:*")
            for key in cache_keys:
                cache.delete(key)
        except Exception:
            pass

    def _invalidate_post_list_cache(self):
        
        
        cache_keys=cache.keys("post_list:*")
        
        for key in cache_keys:
            cache.delete(key)

    def _invalidate_post_detail_cache(self,slug):
        
        
        cache_keys=cache.keys("post_detail:*")
        
        for key in cache_keys:
            cache.delete(key)
            

class PostPagination(PageNumberPagination):
    page_size = 10  
    page_size_query_param = 'page_size'
    max_page_size = 50  


class PostListView(StandardAPIView):
    """List published posts with filters. Use case: ListPostsUseCase; cache in adapter."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            search = request.query_params.get("search", "").strip()
            sorting = request.query_params.get("sorting", None)
            ordering = request.query_params.get("ordering", None)
            author = request.query_params.get("author", None)
            is_featured = request.query_params.get("is_featured", None)
            categories = request.query_params.getlist("categories", [])
            feed = request.query_params.get("feed", None)
            page = request.query_params.get("p", "1")

            serializer_ctx = {'request': request}

            is_featured_bool = None
            if is_featured is not None:
                is_featured_bool = str(is_featured).lower() in ("true", "1", "yes")

            followed_by_user = None
            if feed == "following" and request.user.is_authenticated:
                followed_by_user = request.user

            posts = list_posts_use_case.execute(
                search=search or None,
                author_username=author,
                category_ids_or_slugs=categories or None,
                is_featured=is_featured_bool,
                sorting=sorting,
                ordering=ordering,
                followed_by_user=followed_by_user,
            )
            # Sin posts: devolver 200 con lista vacía (no 404) para mostrar mensaje amigable
            if not posts.exists():
                return self.paginate(request, [])

            serialized_posts = PostListSerializer(posts, many=True, context=serializer_ctx).data
            post_ids = [p.id for p in posts]
            _bulk_increment_impressions(post_ids, request)
            return self.paginate(request, serialized_posts)
        except Exception as e:
            return self.error(f"Error inesperado: {str(e)}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PostDetailView(StandardAPIView):
    

    def get(self, request):
        ip_address = get_client_ip(request)
        slug = request.query_params.get("slug")
        user = request.user if request.user.is_authenticated else None

        if not slug:
            raise NotFound(detail="A valid slug must be provided")

        try:
            # Verificar si los datos están en caché
            cache_key = f"post_detail:{slug}"
            cached_post = cache.get(cache_key)
            if cached_post:
                serialized_post = PostSerializer(cached_post, context={'request': request}).data
                self._register_view_interaction(cached_post, ip_address, user)
                return self.response(serialized_post)

            # Si no está en caché, obtener el post de la base de datos
            try:
                post = Post.objects.get(slug=slug)
            except Post.DoesNotExist:
                raise NotFound(f"Post {slug} does not exist.")

            serialized_post = PostSerializer(post, context={'request': request}).data

            # Guardar en el caché
            cache.set(cache_key, post, timeout=60 * 5)

            # Registrar interaccion
            self._register_view_interaction(post, ip_address, user)
            

        except Post.DoesNotExist:
            raise NotFound(detail="The requested post does not exist")
        except Exception as e:
            raise APIException(detail=f"An unexpected error occurred: {str(e)}")

        return self.response(serialized_post)
    def _register_view_interaction(self, post, ip_address, user):
        """
        Registra vista única: 1 por usuario/post (o por IP si anónimo). Recargas no incrementan.
        """
        if user:
            exists = PostView.objects.filter(post=post, user=user).exists()
        else:
            exists = PostView.objects.filter(post=post, ip_address=ip_address, user__isnull=True).exists()
        if not exists:
            PostView.objects.create(post=post, ip_address=ip_address, user=user)
            # El signal post_save de PostView ya incrementa analytics.views
           

class PostHeadingsView(APIView):
    serializer_class=HeadingSerializer
    
    
    def get(self,request):
        post_slug=request.query_params.get("slug")
        heading_objects=Heading.objects.filter(post__slug=post_slug)
        serializer_data=HeadingSerializer(heading_objects,many=True).data
        return Response(serializer_data)
    # def get_queryset(self):
    #     post_slug=self.kwargs['slug']
    #     return Heading.objects.filter(post__slug=post_slug)



class IncrementPostView(APIView):
    
    def post(self,request):
        
        
        data=request.data
        try:
            post=Post.postobjects.get(slug=data['slug'])
        except Post.DoesNotExist:
            raise NotFound(detail="the requested post does not exist")
             
        try:
            post_analytics, created = PostAnalytics.objects.get_or_create(post=post)
            post_analytics.increment_clicks()  # Correcto: sin argumentos adicionales
        except Exception as e:
            raise APIException(detail=f"An error occurred while updating post analytics: {str(e)}")
        return self.response({
            "message":"click incremented successfully",
            "clicks":post_analytics.clicks             
        })

class CategoryListView(StandardAPIView):
    def get(self, request):
        parent_slug = request.query_params.get("parent_slug", None)
        ordering = request.query_params.get("ordering", None)
        sorting = request.query_params.get("sorting", None)
        search = request.query_params.get("search", "").strip()

        categories = list_categories_use_case.execute(
            parent_slug=parent_slug,
            search=search,
            ordering=ordering,
            sorting=sorting,
        )

        serialized_categories = CategoryListSerializer(categories, many=True).data

        for category in categories:
            _safe_redis_incr(f"category:impressions:{category.id}")

        return self.paginate(request, serialized_categories)
           
           
class CategoryDetailView(APIView):
    def get(self, request):
        try:
            slug = request.query_params.get("slug", None)
            page = request.query_params.get("p", "1")
            if not slug:
                return Response({"error": "Missing slug parameter"}, status=status.HTTP_400_BAD_REQUEST)

            cache_key = f"category_posts:{slug}:{page}"
            serializer_ctx = {"request": request}
            cached_posts = cache.get(cache_key)
            if cached_posts:
                serialized_posts = PostListSerializer(cached_posts, many=True, context=serializer_ctx).data
                _bulk_increment_impressions([p.id for p in cached_posts], request)
                return Response(serialized_posts)

            posts = list_posts_use_case.execute(category_ids_or_slugs=[slug])
            if not posts.exists():
                raise NotFound(detail="No posts found for this category.")

            cache.set(cache_key, posts, timeout=60 * 5)
            serialized_posts = PostListSerializer(posts, many=True, context=serializer_ctx).data
            _bulk_increment_impressions([p.id for p in posts], request)
            return Response(serialized_posts)
        except NotFound:
            raise
        except Exception as e:
            raise APIException(detail=f"An unexpected error occurred: {str(e)}")         
           
           
class ListPostCommentsView(StandardAPIView):
    def get(self, request):
        post_slug = request.query_params.get("slug", None)

        if not post_slug:
            raise NotFound(detail="A valid post slug must be provided")

        comments = list_comments_use_case.execute(post_slug)
        serialized_comments = CommentSerializer(comments, many=True).data

        return self.paginate(request, serialized_comments)   
    
                      
class IncrementCategoryClicksView(APIView):
    
    def post(self,request):
        
        
        data=request.data
        try:
            category=Category.objects.get(slug=data['slug'])
        except Category.DoesNotExist:
            raise NotFound(detail="The requested category does not exist")
             
        try:
            category_analytics, created = CategoryAnalytics.objects.get_or_create(category=category)
            category_analytics.increment_clicks()
        except Exception as e:
            raise APIException(detail=f"An error occurred while updating category analytics: {str(e)}")
        return self.response({
            "message":"click incremented successfully",
            "clicks":category_analytics.clicks             
        })           
           
class PostCommentViews(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from apps.user_profile.notifications import create_notification

        post_slug = request.data.get("post_slug", None)
        content = sanitize_html(request.data.get("content", None))
        ip_address = get_client_ip(request)

        if not post_slug:
            raise NotFound(detail="A valid post slug must be provided")

        comment = create_comment_use_case.execute(
            user=request.user, post_slug=post_slug,
            content=content, ip_address=ip_address,
        )

        if comment.post.user != request.user:
            create_notification(
                sender=request.user,
                recipient=comment.post.user,
                notification_type="comment",
                post=comment.post,
                comment=comment,
            )

        return self.response(f"Comment created for post: {comment.post.title}")

    def put(self, request):
        from .api.dependencies import _comment_repo

        comment_id = request.data.get("comment_id", None)
        content = sanitize_html(request.data.get("content", None))

        if not comment_id:
            raise NotFound(detail="A valid comment id must be provided")
        if not content:
            raise ValidationError(detail="Content is required")

        comment = _comment_repo.get_by_id_and_user(comment_id, request.user)
        _comment_repo.update_content(comment, content)

        return self.response("Comment updated successfully")

    def delete(self, request):
        from .api.dependencies import _comment_repo, _interaction_repo

        comment_id = request.query_params.get("comment_id", None)

        if not comment_id:
            raise NotFound(detail="A valid comment id must be provided")

        comment = _comment_repo.get_by_id_and_user(comment_id, request.user)
        post = comment.post
        _comment_repo.delete(comment)

        analytics = _interaction_repo.get_or_create_analytics(post)
        analytics.comments = _comment_repo.count_active(post)
        analytics.save()

        return self.response("Comment deleted successfully")   
        
        
class ListCommentRepliesView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        comment_id = request.query_params.get("comment_id", None)

        if not comment_id:
            raise NotFound(detail="A valid comment id must be provided")

        replies = list_replies_use_case.execute(comment_id)
        serialized_replies = CommentSerializer(replies, many=True).data

        return self.paginate(request, serialized_replies)
        
        
class CommentReplyViews(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        comment_id = request.data.get("comment_id", None)
        content = sanitize_html(request.data.get("content", None))
        ip_address = get_client_ip(request)

        if not comment_id:
            raise NotFound(detail="A valid comment id must be provided")

        create_reply_use_case.execute(
            user=request.user, comment_id=comment_id,
            content=content, ip_address=ip_address,
        )
        return self.response("Reply created successfully")
        
        
        
class PostLikeView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from apps.user_profile.notifications import create_notification

        post_slug = request.data.get("slug", None)
        ip_address = get_client_ip(request)

        if not post_slug:
            raise NotFound(detail="A valid post slug must be provided")

        try:
            result = toggle_like_use_case.like(request.user, post_slug, ip_address)
        except ValueError as e:
            raise ValidationError(detail=str(e))

        try:
            post = Post.objects.get(slug=post_slug)
            if post.user != request.user:
                create_notification(
                    sender=request.user,
                    recipient=post.user,
                    notification_type="like",
                    post=post,
                )
        except Post.DoesNotExist:
            pass

        return self.response(f"You have liked the post '{result['post_title']}'")

    def delete(self, request):
        post_slug = request.query_params.get("slug", None)

        if not post_slug:
            raise NotFound(detail="A valid post slug must be provided")

        try:
            result = toggle_like_use_case.unlike(request.user, post_slug)
        except ValueError as e:
            raise ValidationError(detail=str(e))

        return self.response(f"You have unliked the post '{result['post_title']}'")
        
 
class PostShareView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        post_slug = request.data.get("slug", None)
        platform = request.data.get("plataform", "other").lower()
        user = request.user if request.user.is_authenticated else None
        ip_address = get_client_ip(request)

        if not post_slug:
            raise NotFound(detail="A valid post slug must be provided")

        try:
            result = share_post_use_case.execute(
                post_slug=post_slug, platform=platform,
                ip_address=ip_address, user=user,
            )
        except ValueError as e:
            raise ValidationError(detail=str(e))

        return self.response(
            f"Post '{result['post_title']}' shared successfully on {result['platform'].capitalize()}"
        )
 
        
class GenerateFakePostView(StandardAPIView):
    """Genera posts de prueba con imagen (Picsum), contenido y fechas reales en el pasado."""

    def get(self, request):
        fake = Faker()
        categories = list(Category.objects.all())
        if not categories:
            return self.response("No hay categorías. Crea al menos una categoría en el blog.", 400)

        # Varios autores para que el feed sea tipo Twitter (no todo del mismo usuario)
        users = list(UserAccount.objects.filter(is_active=True)[:20])
        if not users:
            return self.response("No hay usuarios en el sistema. Crea un usuario (o superusuario) primero.", 400)

        posts_to_generate = 100
        status_options = ["draft", "published"]

        for i in range(posts_to_generate):
            user = users[i % len(users)]  # Rotar entre todos los usuarios
            title = fake.sentence(nb_words=6).rstrip(".")
            slug_base = slugify(title)[:80] or "post"
            slug = f"{slug_base}-{str(uuid.uuid4())[:8]}"
            # Fecha de creación en el pasado (hasta 2 años atrás) para que "hace X" sea real
            created_at = timezone.now() - timedelta(
                days=random.randint(0, 730),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )

            post = Post(
                id=uuid.uuid4(),
                user=user,
                title=title,
                description=fake.sentence(nb_words=12),
                content=fake.paragraph(nb_sentences=5),
                keywords=", ".join(fake.words(nb=5)),
                slug=slug,
                category=random.choice(categories),
                status=random.choice(status_options),
                created_at=created_at,
            )

            # Imagen real desde Picsum (variada por seed) para que cada post tenga miniatura
            has_thumbnail = False
            try:
                img_url = f"https://picsum.photos/seed/{post.id}/800/600"
                with urlopen(img_url, timeout=10) as resp:
                    post.thumbnail.save(
                        f"fake_{uuid.uuid4().hex[:12]}.jpg",
                        ContentFile(resp.read()),
                        save=False,
                    )
                has_thumbnail = True
            except Exception:
                try:
                    with urlopen("https://picsum.photos/800/600", timeout=10) as resp:
                        post.thumbnail.save(
                            f"fake_{uuid.uuid4().hex[:12]}.jpg",
                            ContentFile(resp.read()),
                            save=False,
                        )
                    has_thumbnail = True
                except Exception:
                    pass
            if not has_thumbnail:
                continue  # El modelo exige thumbnail; saltamos este post si no hay imagen

            post.save()

            # Fijar update_at en el pasado para que "actualizado hace X" sea coherente
            updated_at = created_at + timedelta(
                days=random.randint(0, 14),
                hours=random.randint(0, 23),
            )
            Post.objects.filter(pk=post.pk).update(update_at=updated_at)

        return self.response(f"{posts_to_generate} posts generados con imagen y fechas reales.")
    
class GenerateFakeAnalyticsView(StandardAPIView):
    
    def get(self,request):
        
        fake=Faker()
        
        
        posts = Post.objects.all()
        
        if not posts:
            return self.response({"error":"No posts found"},status=400)
        
        analytics_to_generate=len(posts)
        
        for post in posts:
            views=random.randint(50,1000)
            impressions = views + random.randint(100,2000)
            clicks=random.randint(0, views)
            avg_time_on_page=round(random.uniform(10,300),2)
            
            
            analytics, created=PostAnalytics.objects.get_or_create(post=post)
            analytics.views=views
            analytics.impressions = impressions
            analytics.clicks = clicks
            analytics.avg_time_on_page = avg_time_on_page
            analytics._update_click_through_rate()
            analytics.save()
            
        return self.response({"message":f"analiticas generadas para {analytics_to_generate} posts"})


class GenerateDemoUsersView(StandardAPIView):
    """Crea varios usuarios de prueba para que el feed tenga varios autores (demo tipo Twitter)."""

    def get(self, request):
        from apps.user_profile.models import UserProfile

        fake = Faker()
        count = 5
        password_demo = "demo1234"
        created = []
        errors = []

        for i in range(1, count + 1):
            username = f"demo{i}"
            email = f"demo{i}@demo.local"
            if UserAccount.objects.filter(username=username).exists():
                continue
            if UserAccount.objects.filter(email=email).exists():
                email = f"demo{i}_{uuid.uuid4().hex[:6]}@demo.local"
            try:
                user = UserAccount.objects.create_user(
                    email=email,
                    password=password_demo,
                    username=username,
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                )
                user.is_active = True
                user.role = "editor"
                user.save()
                UserProfile.objects.get_or_create(user=user, defaults={"biography": ""})
                created.append(username)
            except Exception as e:
                errors.append(f"{username}: {str(e)}")

        if created:
            return self.response(
                f"Usuarios de prueba creados: {', '.join(created)}. Contraseña para todos: {password_demo}"
            )
        if errors:
            return self.response(
                f"No se pudo crear ningún usuario. Errores: {'; '.join(errors[:3])}",
                400,
            )
        # Todos (demo1–demo5) ya existen → éxito, no es error
        return self.response(
            "Los usuarios demo (demo1–demo5) ya existen. Pulsa 'Generar posts de prueba' para repartir posts entre todos."
        )


class GlobalSearchView(StandardAPIView):
    """Unified search across posts, users, and categories."""

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        search_type = request.query_params.get("type", "all")

        if not q:
            return self.response({"posts": [], "users": [], "categories": []})

        from apps.authentication.serializers import UserPublicSerializer
        from django.db.models import Q

        results = {}

        if search_type in ("all", "posts"):
            posts = Post.postobjects.filter(
                Q(title__icontains=q) | Q(description__icontains=q)
            ).select_related("category", "user")[:10]
            results["posts"] = PostListSerializer(
                posts, many=True, context={"request": request}
            ).data

        if search_type in ("all", "users"):
            results["users"] = UserPublicSerializer(
                UserAccount.objects.filter(
                    Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q),
                    is_active=True,
                )[:10],
                many=True,
            ).data

        if search_type in ("all", "categories"):
            results["categories"] = CategoryListSerializer(
                Category.objects.filter(Q(name__icontains=q) | Q(slug__icontains=q))[:10],
                many=True,
            ).data

        return self.response(results)


class AuthorPostListView(StandardAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            cache_key = f"author_posts:{request.user.username}:{request.query_params.get('p', '1')}:{request.query_params.get('page_size', '12')}"
            cached_posts = cache.get(cache_key)
            if cached_posts:
                return self.paginate(request, cached_posts)

            posts = list_posts_by_author_use_case.execute(request.user).order_by("-created_at")
            if not posts.exists():
                return self.paginate(request, [])

            serialized_posts = PostListSerializer(posts, many=True, context={"request": request}).data
            cache.set(cache_key, serialized_posts, timeout=60 * 5)
            return self.paginate(request, serialized_posts)
        except PostPermissionError:
            return self.error("You do not have permission to view author posts", status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return self.error(f"Error al obtener los posts del autor: {str(e)}", status=status.HTTP_500_INTERNAL_SERVER_ERROR) 