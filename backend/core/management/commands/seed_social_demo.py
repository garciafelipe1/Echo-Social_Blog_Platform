import os
import random
import uuid

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from faker import Faker

from apps.blog.models import Category, Comment, Post, PostLike, PostShare
from apps.user_profile.models import Bookmark, Follow, UserProfile


def _is_truthy(value: str | None) -> bool:
    if not value:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _fake_svg(label: str, color: str) -> bytes:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
<rect width="100%" height="100%" fill="{color}" />
<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-size="28" font-family="Arial" fill="white">{label}</text>
</svg>""".encode("utf-8")


class Command(BaseCommand):
    help = "Seed social demo data: users, profiles, follows, posts, comments, likes."

    def add_arguments(self, parser):
        parser.add_argument("--if-env", action="store_true", help="Run only when SEED_SOCIAL_DEMO is truthy.")
        parser.add_argument("--users", type=int, default=35, help="Number of demo users to ensure.")
        parser.add_argument("--posts-per-user", type=int, default=2, help="Posts per demo user.")
        parser.add_argument("--seed", type=int, default=20260324, help="Deterministic random seed.")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["if_env"] and not _is_truthy(os.getenv("SEED_SOCIAL_DEMO")):
            self.stdout.write("Skipping seed_social_demo (SEED_SOCIAL_DEMO is not enabled).")
            return

        total_users = max(10, int(options["users"]))
        posts_per_user = max(1, int(options["posts_per_user"]))

        fake = Faker(["es_ES", "en_US"])
        Faker.seed(options["seed"])
        random.seed(options["seed"])

        user_model = get_user_model()
        created_users = 0
        users = []

        colors = ["#6366f1", "#14b8a6", "#f97316", "#ef4444", "#22c55e", "#0ea5e9"]
        roles = ["customer", "editor", "helper", "seller"]

        for idx in range(total_users):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f"{slugify(first_name)}{slugify(last_name)}{idx}"
            email = f"{username}@demo-social.local"

            user, created = user_model.objects.get_or_create(
                email=email,
                defaults={
                    "username": username[:90],
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": random.choice(roles),
                    "verified": True,
                    "is_active": True,
                    "is_staff": False,
                },
            )
            if created:
                user.set_password("DemoPass123!")
                user.save(update_fields=["password"])
                created_users += 1
            users.append(user)

            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    "biography": fake.paragraph(nb_sentences=4),
                    "website": f"https://{slugify(first_name)}.dev",
                    "github": f"https://github.com/{username[:25]}",
                    "linkedin": f"https://linkedin.com/in/{username[:25]}",
                },
            )
            if not profile.profile_picture:
                avatar_name = f"avatar_{username}_{uuid.uuid4().hex[:8]}.svg"
                profile.profile_picture.save(
                    avatar_name,
                    ContentFile(_fake_svg(f"{first_name} {last_name}", random.choice(colors))),
                    save=False,
                )
            if not profile.profile_banner:
                banner_name = f"banner_{username}_{uuid.uuid4().hex[:8]}.svg"
                profile.profile_banner.save(
                    banner_name,
                    ContentFile(_fake_svg("Echo Social", random.choice(colors))),
                    save=False,
                )
            if not profile.biography:
                profile.biography = fake.paragraph(nb_sentences=3)
            profile.save()

        category_names = [
            "Tecnologia",
            "Backend",
            "Frontend",
            "IA",
            "DevOps",
            "Productividad",
            "Diseno UX",
        ]
        categories = []
        for name in category_names:
            category, _ = Category.objects.get_or_create(
                slug=slugify(name),
                defaults={"name": name, "title": name, "description": fake.sentence(nb_words=10)},
            )
            categories.append(category)

        posts = []
        created_posts = 0
        for user in users:
            for p in range(posts_per_user):
                title = fake.sentence(nb_words=6).rstrip(".")
                slug = f"{slugify(title)[:80]}-{str(user.id)[:8]}-{p}"
                post, created = Post.objects.get_or_create(
                    slug=slug,
                    defaults={
                        "user": user,
                        "title": title[:240],
                        "description": fake.sentence(nb_words=14)[:250],
                        "content": (
                            f"<h2>{fake.sentence(nb_words=5).rstrip('.')}</h2>"
                            f"<p>{fake.paragraph(nb_sentences=4)}</p>"
                            f"<p>{fake.paragraph(nb_sentences=5)}</p>"
                            f"<ul>"
                            f"<li>{fake.sentence(nb_words=8).rstrip('.')}</li>"
                            f"<li>{fake.sentence(nb_words=8).rstrip('.')}</li>"
                            f"<li>{fake.sentence(nb_words=8).rstrip('.')}</li>"
                            f"</ul>"
                            f"<p>{fake.paragraph(nb_sentences=3)}</p>"
                        ),
                        "keywords": ",".join([slugify(w) for w in fake.words(nb=5)]),
                        "category": random.choice(categories),
                        "status": "published",
                        "featured": random.random() < 0.1,
                    },
                )
                if created and not post.thumbnail:
                    file_name = f"post_{slug}_{uuid.uuid4().hex[:8]}.svg"
                    post.thumbnail.save(
                        file_name,
                        ContentFile(_fake_svg(title[:32], random.choice(colors))),
                        save=False,
                    )
                    post.save()
                    created_posts += 1

                # Hacerlos más "reales": fechas en el pasado (siempre)
                if created:
                    days_ago = random.randint(0, 120)
                    created_at = timezone.now() - timezone.timedelta(days=days_ago, hours=random.randint(0, 23))
                    # Campos: created_at (default), update_at (auto_now) no se setea fácil sin update()
                    Post.objects.filter(pk=post.pk).update(created_at=created_at)
                posts.append(post)

        follows_target = max(len(users) * 5, 100)
        follow_pairs = set(
            Follow.objects.filter(follower__in=users, following__in=users).values_list("follower_id", "following_id")
        )
        while len(follow_pairs) < follows_target:
            follower = random.choice(users)
            following = random.choice(users)
            if follower.id == following.id:
                continue
            pair = (follower.id, following.id)
            if pair in follow_pairs:
                continue
            Follow.objects.create(follower=follower, following=following)
            follow_pairs.add(pair)

        created_likes = 0
        created_comments = 0
        created_shares = 0
        created_bookmarks = 0

        for post in posts:
            like_count = random.randint(0, min(12, len(users)))
            for liker in random.sample(users, like_count):
                _, created = PostLike.objects.get_or_create(post=post, user=liker)
                if created:
                    created_likes += 1

            comment_count = random.randint(0, 5)
            base_comments = []
            for _ in range(comment_count):
                author = random.choice(users)
                comment = Comment.objects.create(
                    user=author,
                    post=post,
                    content="<p>" + fake.paragraph(nb_sentences=2) + "</p>",
                    is_active=True,
                )
                base_comments.append(comment)
                created_comments += 1

                if random.random() < 0.35:
                    replier = random.choice(users)
                    Comment.objects.create(
                        user=replier,
                        post=post,
                        parent=comment,
                        content="<p>" + fake.sentence(nb_words=12) + "</p>",
                        is_active=True,
                    )
                    created_comments += 1

            share_count = random.randint(0, 3)
            for _ in range(share_count):
                PostShare.objects.create(
                    post=post,
                    user=random.choice(users) if random.random() > 0.2 else None,
                    plataform=random.choice(["facebook", "twitter", "linkedin", "whatsapp", "telegram", "other"]),
                )
                created_shares += 1

            bookmark_count = random.randint(0, 4)
            for saver in random.sample(users, min(bookmark_count, len(users))):
                _, created = Bookmark.objects.get_or_create(user=saver, post=post)
                if created:
                    created_bookmarks += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Seed social demo OK | "
                f"users_total={len(users)} created_users={created_users} "
                f"posts_total={len(posts)} created_posts={created_posts} "
                f"follows={len(follow_pairs)} likes_created={created_likes} "
                f"comments_created={created_comments} shares_created={created_shares} "
                f"bookmarks_created={created_bookmarks}"
            )
        )
