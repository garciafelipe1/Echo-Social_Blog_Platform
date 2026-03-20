from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from core.views import health_check

urlpatterns = [
    path('api/health/', health_check),
    path('api/authentication/', include('apps.authentication.urls')),
    path('api/profile/', include('apps.user_profile.urls')),
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
    path('api/blog/', include('apps.blog.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('admin/', admin.site.urls),
]
#  + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)