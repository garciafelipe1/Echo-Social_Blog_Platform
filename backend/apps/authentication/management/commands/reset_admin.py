"""
Comando: python manage.py reset_admin

Borra el admin existente (admin@echo.local) y crea uno nuevo con contraseña por defecto.
"""

from django.core.management.base import BaseCommand

from apps.authentication.models import UserAccount
from apps.user_profile.models import UserProfile


ADMIN_EMAIL = "admin@echo.local"
ADMIN_USERNAME = "admin_echo"
DEFAULT_PASSWORD = "admin1234"


class Command(BaseCommand):
    help = "Borra el admin y crea uno nuevo (útil si olvidaste la contraseña)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            type=str,
            default=DEFAULT_PASSWORD,
            help=f"Contraseña para el nuevo admin (default: {DEFAULT_PASSWORD})",
        )

    def handle(self, *args, **options):
        password = options["password"]

        # Borrar admin existente
        deleted = UserAccount.objects.filter(email=ADMIN_EMAIL).delete()
        if deleted[0] > 0:
            self.stdout.write(self.style.SUCCESS(f"Admin eliminado."))

        # Crear nuevo admin
        try:
            admin = UserAccount.objects.create_superuser(
                email=ADMIN_EMAIL,
                password=password,
                username=ADMIN_USERNAME,
                first_name="Admin",
                last_name="Echo",
            )
            UserProfile.objects.get_or_create(
                user=admin, defaults={"biography": "Administrador de Echo"}
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"\nAdmin creado correctamente.\n"
                    f"  Email: {ADMIN_EMAIL}\n"
                    f"  Usuario: {ADMIN_USERNAME}\n"
                    f"  Contraseña: {password}"
                )
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
