"""
Dependency wiring for blog API. Instantiates repositories and use cases.
In tests you can override these with mocks.
"""

from apps.blog.infrastructure import (
    DjangoPostRepository,
    DjangoCategoryRepository,
    DjangoCommentRepository,
    DjangoInteractionRepository,
)
from apps.blog.application.use_cases import (
    ListPostsUseCase,
    GetPostBySlugUseCase,
    ListCategoriesUseCase,
    GetCategoriesSimpleUseCase,
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    ListPostsByAuthorUseCase,
    CreateCommentUseCase,
    ListCommentsUseCase,
    CreateReplyUseCase,
    ListRepliesUseCase,
    ToggleLikeUseCase,
    SharePostUseCase,
)

_category_repo = DjangoCategoryRepository()
_post_repo = DjangoPostRepository(category_repository=_category_repo)
_comment_repo = DjangoCommentRepository()
_interaction_repo = DjangoInteractionRepository()

list_posts_use_case = ListPostsUseCase(_post_repo)
get_post_by_slug_use_case = GetPostBySlugUseCase(_post_repo)
list_categories_use_case = ListCategoriesUseCase(_category_repo)
get_categories_simple_use_case = GetCategoriesSimpleUseCase(_category_repo)
create_post_use_case = CreatePostUseCase(_post_repo, _category_repo)
update_post_use_case = UpdatePostUseCase(_post_repo, _category_repo)
delete_post_use_case = DeletePostUseCase(_post_repo)
list_posts_by_author_use_case = ListPostsByAuthorUseCase(_post_repo)

create_comment_use_case = CreateCommentUseCase(_post_repo, _comment_repo, _interaction_repo)
list_comments_use_case = ListCommentsUseCase(_comment_repo)
create_reply_use_case = CreateReplyUseCase(_comment_repo, _interaction_repo)
list_replies_use_case = ListRepliesUseCase(_comment_repo)
toggle_like_use_case = ToggleLikeUseCase(_post_repo, _interaction_repo)
share_post_use_case = SharePostUseCase(_post_repo, _interaction_repo)
