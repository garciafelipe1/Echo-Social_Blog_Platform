"""Core views: health check, etc."""

from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings


def health_check(request):
    """Health check for load balancers and monitoring. Returns 200 if DB and cache are OK."""
    status = {"status": "ok", "checks": {}}

    # DB check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        status["checks"]["database"] = "ok"
    except Exception as e:
        status["checks"]["database"] = f"error: {str(e)}"
        status["status"] = "degraded"

    # Cache check (skip if not using Redis)
    if getattr(settings, "USE_REDIS", False):
        try:
            cache.set("health_check", 1, 5)
            cache.get("health_check")
            status["checks"]["cache"] = "ok"
        except Exception as e:
            status["checks"]["cache"] = f"error: {str(e)}"
            status["status"] = "degraded"
    else:
        status["checks"]["cache"] = "skipped (not using Redis)"

    status_code = 200 if status["status"] == "ok" else 503
    return JsonResponse(status, status=status_code)
