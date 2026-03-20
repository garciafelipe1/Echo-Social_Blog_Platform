# Echo — Red Social y Blog Full-Stack

[![Django](https://img.shields.io/badge/Django-4.2-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Una plataforma social completa que combina la inmediatez de Twitter con la profundidad de Medium.**  
> Clean Architecture en frontend y backend, autenticación JWT + OTP, analytics de impresiones únicas y arquitectura preparada para producción.

---

## 🎯 ¿Por qué este proyecto destaca?

| Aspecto | Detalle |
|---------|---------|
| **Arquitectura** | Clean Architecture aplicada en **ambos** lados: Django (domain → application → infrastructure) y Next.js (ports, use cases, adapters) |
| **Stack moderno** | React 19, Next.js 15, TypeScript 5.5, Tailwind 4, Django 4.2 |
| **Seguridad** | JWT (access + refresh), activación por email, login OTP, 2FA opcional, roles (admin/customer) |
| **Analytics real** | Impresiones únicas por usuario (Redis + TTL 24h), sin doble conteo en refresh |
| **UX** | Feed tipo Twitter (For You / Following), infinite scroll, dark mode, responsive, optimistic UI |
| **Infraestructura** | Docker Compose, BFF con Next.js API routes, Django Channels para WebSockets |

---

## 📋 Tabla de contenidos

- [Demo y capturas](#-demo-y-capturas)
- [Características principales](#-características-principales)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Inicio rápido](#-inicio-rápido)
- [Variables de entorno](#-variables-de-entorno)
- [API y diseño de datos](#-api-y-diseño-de-datos)
- [Despliegue y escalabilidad](#-despliegue-y-escalabilidad)
- [Sobre el desarrollador](#-sobre-el-desarrollador)

---

## 🖼️ Demo y capturas

| Inicio (Feed) | Blog (Explorar) | Detalle de post |
|---------------|-----------------|-----------------|
| Feed tipo Twitter con pestañas, compositor y sidebars | Filtros por categoría, post destacado, grid | Post completo con comentarios, likes y compartir |

**Probar en local:** [Inicio rápido](#-inicio-rápido) → luego abre **http://localhost:3006** (Docker) o **http://localhost:3000** (desarrollo local).

---

## ✨ Características principales

| Funcionalidad | Descripción |
|---------------|-------------|
| **Feed** | Pestañas "Para ti" y "Siguiendo", infinite scroll, skeleton loaders |
| **Posts** | Crear, editar, eliminar; editor rico (TipTap), imágenes, categorías |
| **Comentarios** | Comentarios anidados con respuestas, preview en cards |
| **Likes** | Optimistic UI, contador en tiempo real |
| **Seguir autores** | Follow/unfollow, feed filtrado por autores seguidos |
| **Bookmarks** | Guardar posts para leer después |
| **Notificaciones** | Likes, comentarios, follows; contador de no leídas, marcar como leído |
| **Búsqueda global** | Búsqueda full-text en posts, autores y categorías |
| **Analytics** | Impresiones únicas (por usuario/IP), vistas, likes, comentarios |
| **Perfiles** | Avatar, banner, bio, enlaces sociales; posts por autor |
| **Auth** | JWT (access + refresh), activación por email, login OTP, reset de contraseña |
| **Dark mode** | Preferencia del sistema + toggle manual |
| **Responsive** | Mobile-first, navegación inferior, modales a pantalla completa |

---

## 🛠️ Stack tecnológico

### Frontend

| Tecnología | Uso |
|------------|-----|
| **Next.js 15** | Framework React, Pages Router, API routes (BFF) |
| **React 19** | Componentes, hooks |
| **TypeScript 5.5** | Tipado estático, interfaces |
| **Tailwind CSS 4** | Estilos utility-first, dark mode |
| **Redux Toolkit** | Estado de auth, persistencia con redux-persist |
| **TipTap** | Editor de texto enriquecido |
| **Playwright** | Tests E2E |

### Backend

| Tecnología | Uso |
|------------|-----|
| **Django 4.2** | API REST, ORM, admin |
| **Django REST Framework** | Serializers, vistas, paginación |
| **Djoser** | Endpoints de auth (registro, activación, reset) |
| **Simple JWT** | Tokens access + refresh |
| **Django Channels** | WebSockets (ASGI) |
| **Celery** | Tareas en background (opcional) |
| **drf-spectacular** | Documentación OpenAPI |
| **pytest** | Tests unitarios |

### Base de datos y caché

| Tecnología | Uso |
|------------|-----|
| **PostgreSQL 16** | Base de datos principal |
| **Redis 7** | Caché, capa de Channels, deduplicación de impresiones |

### Infraestructura

| Tecnología | Uso |
|------------|-----|
| **Docker Compose** | Orquestación multi-contenedor |
| **Uvicorn** | Servidor ASGI para Django |
| **Mailpit** | Captura de emails en desarrollo |
| **WhiteNoise** | Servir archivos estáticos |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (Next.js SPA)                               │
│  Pages Router │ Redux │ Componentes │ Hooks │ Use Cases (Clean Architecture) │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ fetch (cookies, JWT)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API ROUTES (BFF)                                  │
│  /api/blog/*  │  /api/auth/*  │  /api/profile/*  │  /api/notifications/*      │
│  Proxy a Django, reenvío de Authorization, manejo de CORS                     │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTP
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DJANGO REST API                                      │
│  Views (delgadas) → Use Cases → Repositories → Models                         │
│  JWT Auth │ Paginación │ Serializers                                         │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │ PostgreSQL  │ │   Redis     │ │   Media     │
            │ (ORM)       │ │ (cache,     │ │ (uploads)   │
            │             │ │  dedup)     │ │             │
            └─────────────┘ └─────────────┘ └─────────────┘
```

### Clean Architecture (Backend)

```
apps/blog/
├── domain/           # Ports (IPostRepository), excepciones
├── application/      # Use cases (ListPosts, GetPostBySlug, CreatePost, ...)
├── infrastructure/   # DjangoPostRepository (ORM)
├── api/              # dependencies.py (inyección)
├── views.py          # Delgadas: extraen params → llaman use case → serializan
└── models.py         # Modelos Django
```

### Clean Architecture (Frontend)

```
src/
├── domain/           # Errores, tipos
├── application/      # Ports (IBlogApiPort), use cases, container
├── infrastructure/   # BlogApiAdapter (fetch)
├── hooks/            # usePosts, useLike, useCategories
└── components/       # UI
```

### Flujo de datos: listar posts

1. **Frontend** (`usePosts`) → `listPostsUseCase.execute(params)`
2. **Use case** → `IBlogApiPort.fetchPostList(params)`
3. **Adapter** → `fetch('/api/blog/post/list/?...')`
4. **Next.js API route** → proxy a Django con JWT
5. **Django View** → `list_posts_use_case.execute()` → repository → ORM
6. **Tracking de impresiones** → Redis dedup → actualización en DB
7. **Respuesta** → JSON paginado con `view_count`, `likes_count`, `comments_count`

---

## 🚀 Inicio rápido

### Requisitos

- **Docker** y **Docker Compose** (recomendado), o
- **Node.js 18+**, **Python 3.11+**, **PostgreSQL**, **Redis** (desarrollo local)

### Opción A: Docker (recomendado)

```bash
git clone https://github.com/tu-usuario/fullstack-django-nextjs.git
cd fullstack-django-nextjs

cp .env.example .env
# Edita .env y define SECRET_KEY (ej: python -c "import secrets; print(secrets.token_urlsafe(50))")

npm run docker:up

docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

**URLs:**

- Frontend: **http://localhost:3006**
- Backend API: **http://localhost:7000**
- Mailpit (emails): **http://localhost:8025**

### Opción B: Desarrollo local

**Backend:**

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
```

Crea `backend/.env` con DB y Redis (ver [Variables de entorno](#-variables-de-entorno)).

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm install
```

Crea `frontend/.env.local`:

```
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

**Ejecutar ambos desde la raíz:**

```bash
npm run dev
```

Backend: **http://localhost:8000** | Frontend: **http://localhost:3000**

---

## ⚙️ Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SECRET_KEY` | Clave secreta Django | `tu-clave-segura` |
| `DEBUG` | Modo debug | `True` |
| `ALLOWED_HOSTS` | Hosts permitidos | `localhost,127.0.0.1,backend` |
| `DATABASE_HOST` | Host de DB | `postgres` (Docker) / `127.0.0.1` (local) |
| `DATABASE_PORT` | Puerto DB | `5432` |
| `DATABASE_NAME` | Nombre DB | `django_db` |
| `DATABASE_USER` | Usuario DB | `django` |
| `DATABASE_PASSWORD` | Contraseña DB | `postgres` |
| `REDIS_HOST` | Host Redis | `redis` (Docker) / `localhost` |
| `REDIS_URL` | URL Redis | `redis://redis:6379/0` |
| `FRONTEND_URL` | URL del frontend (emails) | `http://localhost:3000` |
| `API_URL` | URL del backend (Next.js) | `http://localhost:7000` |
| `NEXT_PUBLIC_API_URL` | URL del backend (cliente) | `http://localhost:7000` |

---

## 📡 API y diseño de datos

### Autenticación (Djoser + JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/users/` | Registro |
| POST | `/auth/jwt/create/` | Login (access + refresh) |
| POST | `/auth/jwt/refresh/` | Refrescar token |
| GET | `/auth/users/me/` | Usuario actual |

### Blog

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/blog/posts/` | Listar posts (p, page_size, search, categories, feed=following, is_featured) |
| GET | `/api/blog/post/get/?slug=` | Detalle de post |
| POST | `/api/blog/post/like/` | Toggle like |
| GET | `/api/blog/post/comments/` | Listar comentarios |
| POST | `/api/blog/post/comment/` | Crear comentario |
| GET | `/api/blog/categories/list/` | Listar categorías |
| GET | `/api/blog/search/` | Búsqueda global |

### Perfil y social

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/profile/my_profile/` | Perfil actual |
| GET | `/api/profile/notifications/` | Notificaciones |
| POST | `/api/profile/follow/` | Follow/unfollow |
| GET | `/api/profile/bookmarks/` | Bookmarks del usuario |
| POST | `/api/profile/bookmarks/` | Añadir/quitar bookmark |

### Modelos principales

| Modelo | Descripción |
|--------|-------------|
| **UserAccount** | Usuario (Django), email, username, roles |
| **UserProfile** | Bio, avatar, banner, enlaces sociales |
| **Post** | Título, contenido, thumbnail, categoría, autor, estado |
| **Category** | Jerárquica (parent/children), slug |
| **Comment** | Anidados (parent para respuestas), rich text |
| **PostLike** | Único (post, user) |
| **PostView** | Único (post, user, ip) para vistas de detalle |
| **PostAnalytics** | impresiones, vistas, likes, comentarios, shares |
| **Follow** | follower → following |
| **Notification** | like, comment, reply, follow |
| **Bookmark** | user → post |

---

## 📈 Despliegue y escalabilidad

| Decisión | Motivo |
|----------|--------|
| **Actualización bulk de impresiones** | Un solo `UPDATE ... SET impressions = impressions + 1` para N posts |
| **Redis para dedup** | Lookup O(1); TTL 24h evita crecimiento ilimitado |
| **`select_related` / `prefetch_related`** | Reduce N+1 en endpoints de listado |
| **Paginación** | Cursor/page para no cargar datasets completos |
| **BFF con Next.js** | Origen único, reenvío de auth, posible caché server-side |
| **Django Channels + Redis** | Escalado horizontal de workers WebSocket |

**Producción:** Gunicorn/Uvicorn tras Nginx, PostgreSQL gestionado (RDS, Supabase), Redis gestionado (ElastiCache, Upstash), WhiteNoise o CDN para estáticos, Resend/SendGrid/SES para email.

---

## 🧪 Testing

- **Frontend:** `npm run lint` (ESLint), `npm run format` (Prettier), `npm run test:e2e` (Playwright)
- **Backend:** pytest para tests unitarios; documentación OpenAPI con drf-spectacular

---

## 🔮 Mejoras futuras

- [ ] Rate limiting en endpoints
- [ ] SEO: Open Graph, meta tags, sitemap
- [ ] CI/CD con GitHub Actions
- [ ] Notificaciones en tiempo real vía WebSockets
- [ ] Optimización de imágenes (WebP, lazy loading)
- [ ] i18n (internacionalización)

---

## 👤 Sobre el desarrollador

Proyecto de portfolio que demuestra capacidades full-stack, Clean Architecture y patrones orientados a producción. El código prioriza **mantenibilidad**, **testabilidad** y **escalabilidad**.

**Si eres reclutador o CTO** y quieres ver más detalles técnicos, revisar el código o hablar del proyecto, puedes contactarme a través de mi perfil de GitHub o LinkedIn.

---

## 📄 Licencia

MIT License — ver [LICENSE](LICENSE) para más detalles.
