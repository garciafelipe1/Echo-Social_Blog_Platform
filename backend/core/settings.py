import os
import sys
import environ
import dj_database_url
from datetime import timedelta
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
_env_file = BASE_DIR / ".env"
if _env_file.exists():
    environ.Env.read_env(env_file=_env_file)
# En producción (Railway, etc.) las variables vienen del entorno


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool("DEBUG", default=True)

# ALLOWED_HOSTS: lista separada por comas. Railway: añade RAILWAY_PUBLIC_DOMAIN si existe
_allowed = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])
_railway = env("RAILWAY_PUBLIC_DOMAIN", default="")
if _railway and _railway not in _allowed:
    _allowed.append(_railway)
ALLOWED_HOSTS = _allowed

# CORS y CSRF: lista separada por comas. Si FRONTEND_URL está definida, se añade a CORS/CSRF
CORS_ORIGIN_WHITELIST = env.list("CORS_ORIGIN_WHITELIST", default=["http://localhost:3000", "http://127.0.0.1:3000"])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=["http://localhost:3000", "http://127.0.0.1:3000"])
_frontend = env("FRONTEND_URL", default="").rstrip("/")
if _frontend and _frontend not in CORS_ORIGIN_WHITELIST:
    CORS_ORIGIN_WHITELIST = list(CORS_ORIGIN_WHITELIST) + [_frontend]
if _frontend and _frontend not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS = list(CSRF_TRUSTED_ORIGINS) + [_frontend]

SITE_ID = 1
# Nombre de la aplicación (emails, Site framework)
SITE_NAME = env("SITE_NAME", default="EF")
# Dominio para enlaces en emails (activación, reset password). Debe ser el frontend.
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.sites',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

PROJECT_APPS = [
    'core.apps.CoreConfig',
    'apps.authentication',
    'apps.user_profile',
    'apps.blog'
]

THIRD_PARTY_APPS = [
    'corsheaders',
    'rest_framework',
    'rest_framework_api',
    'channels',
    'ckeditor',
    'ckeditor_uploader',
    'django_celery_results',
    'django_celery_beat',
    'djoser',
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    'axes',
    'drf_spectacular',
]


INSTALLED_APPS = DJANGO_APPS + PROJECT_APPS + THIRD_PARTY_APPS


CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'full',
        'autoParagraph': False
    },
}

CKEDITOR_UPLOAD_PATH = "media/"

AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = lambda request: timedelta(minutes=1)
AXES_LOCK_OUT_AT_FAILURE = True

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'axes.middleware.AxesMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
# Railway: usa DATABASE_URL. Local: usa DATABASE_NAME, USER, PASSWORD, HOST, PORT
if env("DATABASE_URL", default=""):
    DATABASES = {"default": dj_database_url.parse(env("DATABASE_URL"))}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("DATABASE_NAME"),
            "USER": env("DATABASE_USER"),
            "PASSWORD": env("DATABASE_PASSWORD"),
            "HOST": env("DATABASE_HOST"),
            "PORT": env("DATABASE_PORT"),
        }
    }

# Usar SQLite en memoria para tests (evita necesitar CREATE DATABASE en PostgreSQL)
if 'test' in sys.argv:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]





AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_LOCATION = "static"
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, "static")

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly"
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication"
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/min",
        "user": "300/min",
        "auth": "10/min",
        "create": "20/min",
    },
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "EF API",
    "DESCRIPTION": "Social blog platform API — posts, comments, likes, profiles, auth",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}



AUTHENTICATION_BACKENDS = (
    'axes.backends.AxesStandaloneBackend',
    
    'django.contrib.auth.backends.ModelBackend',
)

AUTH_USER_MODEL = 'authentication.UserAccount'
    


SIMPLE_JWT = {
    "AUTH_HEADER_TYPES": ("JWT",),
    "ACCESS_TOKEN_LIFETIME": timedelta(days=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=60),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "SIGNING_KEY": env("SECRET_KEY"),
}

DJOSER = {
    'LOGIN_FIELD': 'email',
    'USER_CREATE_PASSWORD_RETYPE': True,
    'USERNAME_CHANGED_EMAIL_CONFIRMATION': True,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
    'SEND_CONFIRMATION_EMAIL': True,
    'SEND_ACTIVATION_EMAIL': True,
    

    
    
    
    'PASSWORD_RESET_CONFIRM_URL': 'forgot-password-confirm/?uid={uid}&token={token}',
    'USERNAME_RESET_CONFIRM_URL': 'email/username_reset_confirm/{uid}/{token}',
    'ACTIVATION_URL': 'activate/?uid={uid}&token={token}',
    
    
    
    'SERIALIZERS': {
        "user_create": "apps.authentication.serializers.UserCreateSerializer",
        "user": "apps.authentication.serializers.UserSerializer",
        "current_user": "apps.authentication.serializers.UserSerializer",
        "user_delete": "djoser.serializers.UserDeleteSerializer",
    },
}


# Redis opcional: con USE_REDIS=false usamos caché en memoria (útil sin Redis en local)
USE_REDIS = env.bool("USE_REDIS", default=True)
REDIS_HOST = env("REDIS_HOST", default="localhost")

if USE_REDIS:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [env("REDIS_URL", default="redis://localhost:6379/0")]},
        }
    }
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": env("REDIS_URL", default="redis://localhost:6379/0"),
            "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
        }
    }
else:
    CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
    }
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.dummy.DummyCache",
        }
    }

CHANNELS_ALLOWED_ORIGINS = env("CHANNELS_ALLOWED_ORIGINS", default="http://localhost:3000,http://localhost:3006")

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = "America/Argentina/Buenos_Aires"

CELERY_BROKER_URL = env("REDIS_URL", default="redis://localhost:6379/0")

CELERY_BROKER_TRANSPORT_OPTIONS = {
    'visibility_timeout': 3600,
    'socket_timeout': 5,
    'retry_on_timeout': True
}

CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'default'

CELERY_IMPORTS = (
    'core.tasks',
    'apps.blog.tasks',
)

CELERY_BEAT_SCHEDULE = "django_celery_beat.schedulers:DatabaseScheduler"
CELERY_BEAT_SCHEDULE = {
    
}


# ----- Email: Resend, Mailpit o file backend -----
# Si RESEND_API_KEY está definido → usa Resend SMTP (producción)
# Si no: en DEBUG usa file backend o Mailpit; en producción usa SMTP configurado
RESEND_API_KEY = env("RESEND_API_KEY", default="").strip()
USE_RESEND = bool(RESEND_API_KEY)

if USE_RESEND:
    # Resend SMTP: https://resend.com/docs/send-with-smtp
    # El dominio "from" debe estar verificado en Resend (resend.com/domains)
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = "smtp.resend.com"
    EMAIL_PORT = env.int("RESEND_SMTP_PORT", default=587)  # 587 (TLS) suele funcionar mejor que 465 en Windows
    EMAIL_HOST_USER = "resend"
    EMAIL_HOST_PASSWORD = RESEND_API_KEY
    EMAIL_USE_TLS = EMAIL_PORT == 587
    EMAIL_USE_SSL = EMAIL_PORT == 465
    DEFAULT_FROM_EMAIL = env(
        "RESEND_FROM_EMAIL",
        default="EF <onboarding@resend.dev>",  # Dominio de prueba Resend
    )
else:
    _default_email_backend = (
        "django.core.mail.backends.filebased.EmailBackend"
        if DEBUG
        else "django.core.mail.backends.smtp.EmailBackend"
    )
    EMAIL_BACKEND = env("EMAIL_BACKEND", default=_default_email_backend)
    if DEBUG and EMAIL_BACKEND and "console" in EMAIL_BACKEND.lower():
        EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"

    if DEBUG:
        if "filebased" in EMAIL_BACKEND:
            EMAIL_FILE_PATH = env("EMAIL_FILE_PATH", default=str(BASE_DIR / "emails"))
            os.makedirs(EMAIL_FILE_PATH, exist_ok=True)
        else:
            EMAIL_HOST = env("EMAIL_HOST", default="localhost")
            EMAIL_PORT = env.int("EMAIL_PORT", default=1025)
            EMAIL_USE_TLS = False
            EMAIL_USE_SSL = False
        DEFAULT_FROM_EMAIL = "EF Dev <noreply@localhost>"
    else:
        EMAIL_HOST = env("EMAIL_HOST")
        EMAIL_PORT = env.int("EMAIL_PORT")
        EMAIL_HOST_USER = env("EMAIL_HOST_USER")
        EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
        EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
        DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="EF <noreply@ef.app>")
    

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# En Railway/Gunicorn no se sirven archivos media por defecto.
# Para portfolio/demo se puede habilitar un servido simple desde Django (no recomendado para alto tráfico).
SERVE_MEDIA = env.bool("SERVE_MEDIA", default=DEBUG)

# Tests: evitar Redis (DummyCache) para no depender de Redis en local
if 'test' in sys.argv:
    CACHES = {'default': {'BACKEND': 'django.core.cache.backends.dummy.DummyCache'}}

