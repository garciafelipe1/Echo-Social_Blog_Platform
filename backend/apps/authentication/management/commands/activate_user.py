"""
Comando: python manage.py activate_user email@ejemplo.com

Activa un usuario por email (útil en desarrollo si no tienes acceso al correo).
"""

from django.core.management.base import BaseCommand

from apps.authentication.models import UserAccount


class Command(BaseCommand):
    help = "Activa un usuario por email (desarrollo)"

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="Email del usuario a activar")

    def handle(self, *args, **options):
        email = options["email"].strip()
        try:
            user = UserAccount.objects.get(email__iexact=email)
        except UserAccount.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"No existe ningún usuario con email: {email}"))
            return

        if user.is_active:
            self.stdout.write(self.style.WARNING(f"El usuario {email} ya está activo."))
            return

        user.is_active = True
        user.save()
        self.stdout.write(self.style.SUCCESS(f"Usuario {email} activado. Ya puede iniciar sesión."))
