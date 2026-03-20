"""App config for core (project package)."""

import os
from django.apps import AppConfig
from django.conf import settings


class CoreConfig(AppConfig):
    """Core project configuration."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "core"
    label = "core"
    verbose_name = "Core"

    def ready(self):
        """Ajusta el dominio del Site para que los emails de activación apunten al frontend correcto."""
        if not getattr(settings, "SITE_ID", None):
            return
        frontend_url = getattr(settings, "FRONTEND_URL", "").strip()
        if not frontend_url:
            return
        domain = frontend_url.replace("https://", "").replace("http://", "").rstrip("/")
        if not domain:
            return
        try:
            from django.contrib.sites.models import Site

            site = Site.objects.get(id=settings.SITE_ID)
            if site.domain != domain:
                site.domain = domain
                site.name = domain
                site.save()
        except Exception:
            pass
