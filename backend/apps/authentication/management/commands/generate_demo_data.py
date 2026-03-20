"""
Comando: python manage.py generate_demo_data

Crea 25 usuarios (personas reales vía randomuser.me) y posts escritos por ellos.
Cada usuario tiene entre 2 y 8 posts con contenido realista.
"""

import json
import re
import uuid
import random
from datetime import timedelta
from urllib.request import urlopen, Request
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils import timezone
from django.utils.text import slugify
from faker import Faker

from apps.authentication.models import UserAccount
from apps.user_profile.models import UserProfile
from apps.blog.models import Post, Category


def fetch_random_users(count: int):
    """Obtiene usuarios con fotos desde randomuser.me API."""
    url = f"https://randomuser.me/api/?results={count}&noinfo"
    req = Request(url, headers={"User-Agent": "Echo-Django/1.0"})
    with urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
    return data.get("results", [])


def safe_username(first: str, last: str, index: int) -> str:
    """Genera username limpio (solo a-z, 0-9) para evitar rechazos."""
    base = re.sub(r"[^a-zA-Z0-9]", "", (first + last).lower())[:15]
    return f"{base}{index}" if base else f"user{index}"


class Command(BaseCommand):
    help = "Crea 25 usuarios realistas y posts escritos por ellos"

    def add_arguments(self, parser):
        parser.add_argument(
            "--users",
            type=int,
            default=25,
            help="Número de usuarios (default: 25)",
        )
        parser.add_argument(
            "--posts-per-user",
            type=str,
            default="2-8",
            help="Posts por usuario, ej: 2-8 (default: 2-8)",
        )
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="No pedir confirmación",
        )
        parser.add_argument(
            "--keep-existing",
            action="store_true",
            help="No borrar usuarios/posts existentes, añadir a los actuales",
        )

    def handle(self, *args, **options):
        users_count = options["users"]
        posts_range = options["posts_per_user"]
        no_input = options["no_input"]
        keep_existing = options["keep_existing"]

        try:
            low, high = map(int, posts_range.split("-"))
        except ValueError:
            low, high = 2, 8

        if not no_input and not keep_existing:
            confirm = input(
                "¿Borrar usuarios y posts existentes y crear nuevos? [y/N]: "
            )
            if confirm.lower() != "y":
                self.stdout.write(self.style.WARNING("Cancelado."))
                return

        categories = list(Category.objects.all())
        if not categories:
            self.stdout.write(self.style.ERROR("No hay categorías. Crea al menos una en el blog."))
            return

        fake = Faker("es_ES")
        password = "demo1234"

        # 1. Borrar datos existentes (si no keep_existing)
        if not keep_existing:
            Post.objects.all().delete()
            UserProfile.objects.all().delete()
            UserAccount.objects.filter(is_superuser=False).delete()
            self.stdout.write("Datos anteriores eliminados.")

        # 2. Obtener usuarios de randomuser.me
        existing_count = UserAccount.objects.filter(is_superuser=False).count()
        to_create = max(0, users_count - existing_count)

        if to_create > 0:
            self.stdout.write(f"Obteniendo {to_create} usuarios desde randomuser.me...")
            try:
                api_users = fetch_random_users(to_create)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"No se pudo conectar: {e}"))
                return

            for i, ru in enumerate(api_users):
                first = ru["name"]["first"]
                last = ru["name"]["last"]
                suffix = existing_count + i + 1
                username = safe_username(first, last, suffix)
                while UserAccount.objects.filter(username=username).exists():
                    suffix += 1
                    username = safe_username(first, last, suffix)

                email = f"{username}@demo.echo.local"
                img_url = ru["picture"]["large"]

                try:
                    user = UserAccount.objects.create_user(
                        email=email,
                        password=password,
                        username=username,
                        first_name=first,
                        last_name=last,
                    )
                    user.is_active = True
                    user.role = "editor"
                    user.save()

                    bio = ru.get("location", {}).get("country", "Usuario demo")
                    profile, _ = UserProfile.objects.get_or_create(
                        user=user, defaults={"biography": bio}
                    )
                    try:
                        req = Request(img_url, headers={"User-Agent": "Echo-Django/1.0"})
                        with urlopen(req, timeout=10) as resp:
                            profile.profile_picture.save(
                                f"profile_{uuid.uuid4().hex[:12]}.jpg",
                                ContentFile(resp.read()),
                                save=True,
                            )
                    except Exception:
                        pass
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Error usuario {username}: {e}"))

        # 3. Crear posts por cada usuario
        editors = list(UserAccount.objects.filter(is_active=True, role="editor"))
        if not editors:
            editors = list(UserAccount.objects.filter(is_active=True).exclude(is_superuser=True))
        if not editors:
            self.stdout.write(self.style.ERROR("No hay usuarios editores para crear posts."))
            return

        posts_created = 0
        for user in editors:
            n_posts = random.randint(low, high)
            for _ in range(n_posts):
                title = fake.sentence(nb_words=5).rstrip(".")
                slug_base = slugify(title)[:70] or "post"
                slug = f"{slug_base}-{uuid.uuid4().hex[:8]}"
                created_at = timezone.now() - timedelta(
                    days=random.randint(0, 365),
                    hours=random.randint(0, 23),
                )

                paras = fake.paragraphs(nb=3)
                content = "".join(f"<p>{p}</p>" for p in paras)

                post = Post(
                    id=uuid.uuid4(),
                    user=user,
                    title=title,
                    description=fake.sentence(nb_words=10),
                    content=content,
                    keywords=", ".join(fake.words(nb=4)),
                    slug=slug,
                    category=random.choice(categories),
                    status="published",
                    created_at=created_at,
                )

                try:
                    img_url = f"https://picsum.photos/seed/{post.id}/800/600"
                    req = Request(img_url, headers={"User-Agent": "Echo-Django/1.0"})
                    with urlopen(req, timeout=10) as resp:
                        post.thumbnail.save(
                            f"post_{uuid.uuid4().hex[:10]}.jpg",
                            ContentFile(resp.read()),
                            save=False,
                        )
                except Exception:
                    try:
                        with urlopen("https://picsum.photos/800/600", timeout=10) as resp:
                            post.thumbnail.save(
                                f"post_{uuid.uuid4().hex[:10]}.jpg",
                                ContentFile(resp.read()),
                                save=False,
                            )
                    except Exception:
                        continue

                post.save()
                posts_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nListo. {UserAccount.objects.filter(is_superuser=False).count()} usuarios, "
                f"{posts_created} posts creados. Contraseña: {password}"
            )
        )
