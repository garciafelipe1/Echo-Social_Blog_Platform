import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.blog.models import Category, Post


def _is_truthy(value: str | None) -> bool:
    if not value:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Command(BaseCommand):
    help = "Create demo blog categories and posts (idempotent by slug)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--if-env",
            action="store_true",
            help="Run only when SEED_BLOG_DEMO is truthy.",
        )

    def handle(self, *args, **options):
        if options["if_env"] and not _is_truthy(os.getenv("SEED_BLOG_DEMO")):
            self.stdout.write("Skipping seed_blog_demo (SEED_BLOG_DEMO is not enabled).")
            return

        user_model = get_user_model()
        author, _ = user_model.objects.get_or_create(
            username="demo_author",
            defaults={
                "email": "demo@author.com",
                "first_name": "Demo",
                "last_name": "Author",
                "is_active": True,
            },
        )

        category_names = ["Tecnologia", "Backend", "Frontend"]
        categories = []
        for name in category_names:
            slug = slugify(name)
            category, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "title": name,
                    "description": f"Categoria {name}",
                },
            )
            categories.append(category)

        posts_data = [
            ("Primer post", "Introduccion al blog", "Contenido inicial del blog.", "intro,blog", categories[0]),
            (
                "Django en produccion",
                "Buenas practicas",
                "Deploy, seguridad y rendimiento.",
                "django,backend",
                categories[1],
            ),
            (
                "Next.js tips",
                "Mejorando frontend",
                "SSR, rutas API y optimizacion.",
                "nextjs,frontend",
                categories[2],
            ),
            (
                "API REST limpia",
                "Arquitectura por capas",
                "Puertos, adaptadores y casos de uso.",
                "api,clean-architecture",
                categories[1],
            ),
            (
                "UI reusable",
                "Componentes escalables",
                "Diseno de componentes reutilizables.",
                "ui,components",
                categories[2],
            ),
        ]

        for title, description, content, keywords, category in posts_data:
            slug = slugify(title)
            Post.objects.get_or_create(
                slug=slug,
                defaults={
                    "user": author,
                    "title": title,
                    "description": description,
                    "content": content,
                    "keywords": keywords,
                    "category": category,
                    "status": "published",
                    "featured": False,
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed OK: categories={Category.objects.count()} posts={Post.objects.count()}"
            )
        )
