"""
Comando: python manage.py set_site_domain

Actualiza el dominio del Site para que los enlaces de activación/reset en emails
apunten al frontend correcto. Usa FRONTEND_URL del .env (ej: http://localhost:3000).
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.sites.models import Site


class Command(BaseCommand):
    help = "Actualiza el dominio del Site desde FRONTEND_URL para enlaces en emails"

    def handle(self, *args, **options):
        frontend_url = getattr(settings, "FRONTEND_URL", "").strip()
        if not frontend_url:
            self.stdout.write(
                self.style.WARNING(
                    "FRONTEND_URL no está configurada. Añádela a backend/.env o .env"
                )
            )
            return
        domain = frontend_url.replace("https://", "").replace("http://", "").rstrip("/")
        if not domain:
            self.stdout.write(self.style.ERROR("FRONTEND_URL inválida."))
            return
        try:
            site = Site.objects.get(id=settings.SITE_ID)
            site.domain = domain
            site.name = getattr(settings, "SITE_NAME", "EF")
            site.save()
            self.stdout.write(
                self.style.SUCCESS(f"Site actualizado: dominio = {domain}")
            )
        except Site.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Site con id={settings.SITE_ID} no existe."))
