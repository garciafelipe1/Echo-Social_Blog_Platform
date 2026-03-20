"""
Comando: python manage.py reset_demo_users

Borra todos los usuarios y crea nuevos con:
- Nombres y fotos de personas reales (randomuser.me API)
- Contraseña: demo1234 para todos
"""

import json
import re
import uuid
from urllib.request import urlopen, Request
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile

from apps.authentication.models import UserAccount
from apps.user_profile.models import UserProfile


def fetch_random_users(count: int):
    """Obtiene usuarios con fotos desde randomuser.me API."""
    url = f"https://randomuser.me/api/?results={count}&noinfo"
    req = Request(url, headers={"User-Agent": "Echo-Django/1.0"})
    with urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
    return data.get("results", [])


def safe_username(first: str, last: str, index: int) -> str:
    """Genera username limpio (solo a-z, 0-9, _) para evitar rechazos."""
    base = re.sub(r"[^a-zA-Z0-9]", "", (first + last).lower())[:15]
    return f"{base}{index}" if base else f"user{index}"


class Command(BaseCommand):
    help = "Borra todos los usuarios y crea nuevos con fotos de perfil reales"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=25,
            help="Número de usuarios a crear (default: 25)",
        )
        parser.add_argument(
            "--keep-superuser",
            action="store_true",
            help="Mantener el primer superusuario encontrado",
        )
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="No pedir confirmación",
        )
        parser.add_argument(
            "--create-admin",
            action="store_true",
            help="Crear un superusuario admin al final (email: admin@echo.local)",
        )

    def handle(self, *args, **options):
        count = options["count"]
        keep_superuser = options["keep_superuser"]
        no_input = options["no_input"]
        create_admin = options["create_admin"]

        if not no_input:
            confirm = input(
                "¿Borrar TODOS los usuarios y crear nuevos? Esto eliminará posts, comentarios, etc. [y/N]: "
            )
            if confirm.lower() != "y":
                self.stdout.write(self.style.WARNING("Operación cancelada."))
                return

        password = "demo1234"

        # 1. Borrar usuarios (cascade borra UserProfile, Posts, etc.)
        users_to_delete = UserAccount.objects.all()
        if keep_superuser:
            superuser = users_to_delete.filter(is_superuser=True).first()
            if superuser:
                users_to_delete = users_to_delete.exclude(pk=superuser.pk)
                self.stdout.write(f"Manteniendo superusuario: {superuser.email}")

        deleted = users_to_delete.count()
        users_to_delete.delete()
        self.stdout.write(self.style.SUCCESS(f"Eliminados {deleted} usuarios."))

        # 2. Obtener datos de randomuser.me
        self.stdout.write("Obteniendo usuarios desde randomuser.me...")
        try:
            api_users = fetch_random_users(count)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"No se pudo conectar a randomuser.me: {e}"))
            return

        if len(api_users) < count:
            self.stdout.write(
                self.style.WARNING(f"API devolvió {len(api_users)} usuarios (pedidos: {count})")
            )

        # 3. Crear usuarios
        created = []
        for i, ru in enumerate(api_users):
            first = ru["name"]["first"]
            last = ru["name"]["last"]
            suffix = i + 1
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
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f"  Foto no cargada para {username}: {e}")
                    )

                created.append(username)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creando {username}: {e}"))

        # 4. Opcional: crear superusuario admin
        if create_admin:
            admin_email = "admin@echo.local"
            if not UserAccount.objects.filter(email=admin_email).exists():
                try:
                    admin = UserAccount.objects.create_superuser(
                        email=admin_email,
                        password=password,
                        username="admin_echo",
                        first_name="Admin",
                        last_name="Echo",
                    )
                    UserProfile.objects.get_or_create(
                        user=admin, defaults={"biography": "Administrador de Echo"}
                    )
                    try:
                        admins = fetch_random_users(1)
                        if admins:
                            img_url = admins[0]["picture"]["large"]
                            req = Request(img_url, headers={"User-Agent": "Echo-Django/1.0"})
                            with urlopen(req, timeout=10) as resp:
                                profile = UserProfile.objects.get(user=admin)
                                profile.profile_picture.save(
                                    f"admin_{uuid.uuid4().hex[:8]}.jpg",
                                    ContentFile(resp.read()),
                                    save=True,
                                )
                    except Exception:
                        pass
                    self.stdout.write(
                        self.style.SUCCESS(f"Superusuario creado: {admin_email}")
                    )
                except ValueError as e:
                    if "admin" in str(e).lower():
                        self.stdout.write(
                            self.style.WARNING(
                                "Username 'admin' está restringido. Usa otro o crea superuser manualmente."
                            )
                        )
                    else:
                        raise

        self.stdout.write(
            self.style.SUCCESS(
                f"\nCreados {len(created)} usuarios. Contraseña para todos: {password}"
            )
        )
        self.stdout.write("Usuarios: " + ", ".join(created[:5]) + ("..." if len(created) > 5 else ""))
