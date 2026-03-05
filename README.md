# Echo — Social Blog Platform

[![Django](https://img.shields.io/badge/Django-4.2-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A full-stack social blog platform combining the engagement of Twitter with the depth of Medium.** Built with Clean Architecture, real-time features, and production-ready infrastructure.

---

## Project Overview

**Echo** is a modern social network and blog hybrid where users can publish posts, follow authors, engage with content (likes, comments, bookmarks), and discover content through personalized feeds. The project demonstrates enterprise-grade architecture decisions: Clean Architecture on both frontend and backend, SOLID principles, and scalable patterns for real-time and analytics.

### What Problem Does It Solve?

- **Content discovery**: Feed tabs ("For You" / "Following") with infinite scroll and global search
- **Engagement tracking**: Unique impressions per user (no double-counting on refresh), likes, comments, shares
- **Social graph**: Follow/unfollow system with notifications (likes, comments, follows)
- **Developer experience**: Single-command setup with Docker, BFF pattern for API proxying, JWT auth with refresh tokens

### Why It's Technically Interesting

- **Clean Architecture** applied end-to-end: Domain → Application → Infrastructure on both Django and Next.js
- **Dual feed system**: "For You" (all posts) vs "Following" (curated) with efficient backend filtering
- **Unique impression analytics**: Redis-backed deduplication so each user counts once per post (24h TTL)
- **Real-time ready**: Django Channels + Redis for WebSockets (foundation for live notifications)
- **BFF (Backend-for-Frontend)**: Next.js API routes proxy to Django, forward auth, handle CORS

---

## Demo / Screenshots

| Home Feed | Blog Explore | Post Detail |
|-----------|--------------|-------------|
| Twitter-style feed with tabs, composer, sidebars | Category filters, hero post, grid layout | Full post with comments, likes, share |

**Run locally:** [Installation & Setup](#installation--setup) — then open **http://localhost:3006** (Docker) or **http://localhost:3000** (local dev).

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Feed** | "For You" and "Following" tabs, infinite scroll, skeleton loaders |
| **Posts** | Create, edit, delete; rich text (CKEditor), images, categories |
| **Comments** | Threaded comments with replies, preview on cards (Instagram-style) |
| **Likes** | Optimistic UI, real-time count updates |
| **Follow System** | Follow/unfollow users, feed filtered by followed authors |
| **Bookmarks** | Save posts for later reading |
| **Notifications** | Likes, comments, follows; unread count, mark as read |
| **Global Search** | Full-text search across posts, authors, categories |
| **Analytics** | Unique impressions (per user/IP), views, likes, comments |
| **Profiles** | Avatar, banner, bio, social links; posts by author |
| **Auth** | JWT (access + refresh), email activation, OTP login, password reset |
| **Dark Mode** | System preference + manual toggle |
| **Responsive** | Mobile-first, bottom nav, full-screen modals on small screens |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework, Pages Router, API routes (BFF) |
| **React 19** | UI components, hooks |
| **TypeScript** | Type safety, interfaces |
| **Tailwind CSS 4** | Utility-first styling, dark mode |
| **Redux Toolkit** | Auth state, persisted with redux-persist |
| **TipTap** | Rich text editor |
| **Heroicons** | Icon set |
| **Moment.js** | Date formatting |

### Backend

| Technology | Purpose |
|------------|---------|
| **Django 4.2** | REST API, ORM, admin |
| **Django REST Framework** | Serializers, views, pagination |
| **Djoser** | Auth endpoints (register, activate, reset) |
| **Simple JWT** | Access + refresh tokens |
| **CKEditor** | Rich text in admin and API |
| **Django Channels** | WebSockets (ASGI) |
| **Celery** | Background tasks (optional) |

### Database & Cache

| Technology | Purpose |
|------------|---------|
| **PostgreSQL 16** | Primary database |
| **Redis 7** | Cache (Django cache backend), Channels layer, impression dedup |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker Compose** | Multi-container orchestration |
| **Uvicorn** | ASGI server for Django |
| **Mailpit** | Local email capture (dev) |
| **WhiteNoise** | Static file serving |

### Real-time & APIs

| Technology | Purpose |
|------------|---------|
| **Django Channels** | WebSocket support |
| **channels-redis** | Channel layer for multi-worker |
| **REST** | JSON API, JWT auth |

### Testing

| Technology | Purpose |
|------------|---------|
| **ESLint** | Frontend linting |
| **Prettier** | Code formatting |
| **pytest** (planned) | Backend unit tests |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER (Next.js SPA)                              │
│  Pages Router │ Redux │ Components │ Hooks │ Use Cases (Clean Arch)         │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ fetch (cookies, JWT)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES (BFF Layer)                           │
│  /api/blog/*  │  /api/auth/*  │  /api/profile/*  │  /api/notifications/*   │
│  Proxies to Django, forwards Authorization header, handles CORS              │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTP
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DJANGO REST API                                      │
│  Views (thin) → Use Cases → Repositories → Models                           │
│  JWT Auth │ Pagination │ Serializers                                        │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
            │ PostgreSQL  │ │   Redis     │ │   Media     │
            │ (ORM)       │ │ (cache,     │ │ (uploads)   │
            │             │ │  dedup)    │ │             │
            └─────────────┘ └─────────────┘ └─────────────┘
```

### Data Flow Example: List Posts

1. **Frontend** (`usePosts` hook) → calls `listPostsUseCase.execute(params)`
2. **Use Case** (Clean Arch) → calls `IBlogApiPort.fetchPostList(params)`
3. **Adapter** (`BlogApiAdapter`) → `fetch('/api/blog/post/list/?...')`
4. **Next.js API route** → proxies to `Django /api/blog/posts/` with JWT
5. **Django View** → `list_posts_use_case.execute()` → repository → ORM
6. **Impression tracking** → `_bulk_increment_impressions(post_ids, request)` → Redis dedup → DB update
7. **Response** → paginated JSON with `view_count`, `likes_count`, `comments_count`

---

## Main Features Explained

### Unique Impression Analytics

Impressions are incremented only when a user **first** sees a post. Implemented with:

- **Django cache** (Redis-backed): key `seen:{post_id}:{viewer_id}` with 24h TTL
- **Viewer ID**: `u:{user_id}` (authenticated) or `ip:{client_ip}` (anonymous)
- **Batch dedup**: `cache.get_many()` / `cache.set_many()` for efficiency
- **Atomic DB update**: `PostAnalytics.objects.filter(...).update(impressions=F("impressions")+1)`

### Feed Tabs: For You vs Following

- **For You**: All published posts, paginated
- **Following**: Posts from authors the user follows (`feed=following` query param)
- Backend filters via `followed_by_user` in `ListPostsUseCase`

### Clean Architecture (Backend)

```
apps/blog/
├── domain/           # Ports (IPostRepository), exceptions
├── application/      # Use cases (ListPosts, GetPostBySlug, CreatePost, ...)
├── infrastructure/   # DjangoPostRepository (ORM)
├── api/              # dependencies.py (wiring)
├── views.py          # Thin: extract params → call use case → serialize
└── models.py         # Django models (persistence)
```

### Clean Architecture (Frontend)

```
src/
├── domain/           # Errors, types
├── application/      # Ports (IBlogApiPort), use cases, container
├── infrastructure/   # BlogApiAdapter (fetch)
├── hooks/            # usePosts, useLike, useCategories
└── components/       # UI
```

---

## Database Design

### Core Entities

| Model | Description |
|-------|-------------|
| **UserAccount** | Custom user (Django), email, username |
| **UserProfile** | Bio, avatar, banner, social links |
| **Post** | Title, content, thumbnail, category, author, status |
| **Category** | Hierarchical (parent/children), slug |
| **Comment** | Threaded (parent for replies), rich text |
| **PostLike** | Unique (post, user) |
| **PostView** | Unique (post, user, ip) for detail views |
| **PostAnalytics** | impressions, views, likes, comments, shares |
| **Follow** | follower → following |
| **Notification** | like, comment, reply, follow |
| **Bookmark** | user → post |

### Key Relationships

```
UserAccount 1──1 UserProfile
UserAccount 1──* Post (author)
Post *──1 Category
Post 1──* Comment (post_comments)
Comment *──1 Comment (parent, for replies)
Post 1──* PostLike
Post 1──1 PostAnalytics
Follow: User ──follows──> User
Notification: sender → recipient, optional post/comment
Bookmark: User ──saves──> Post
```

---

## API Design

### Authentication (Djoser + JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/users/` | Register |
| POST | `/auth/jwt/create/` | Login (access + refresh) |
| POST | `/auth/jwt/refresh/` | Refresh token |
| GET | `/auth/users/me/` | Current user |

### Blog

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blog/posts/` | List posts (p, page_size, search, categories, feed=following, is_featured) |
| GET | `/api/blog/post/get/?slug=` | Post detail |
| POST | `/api/blog/post/like/` | Toggle like |
| GET | `/api/blog/post/comments/` | List comments |
| POST | `/api/blog/post/comment/` | Create comment |
| GET | `/api/blog/categories/list/` | List categories |
| GET | `/api/blog/search/` | Global search |

### Profile & Social

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/my_profile/` | Current user profile |
| GET | `/api/profile/notifications/` | Notifications |
| POST | `/api/profile/follow/` | Follow/unfollow |
| GET | `/api/profile/bookmarks/` | User bookmarks |
| POST | `/api/profile/bookmarks/` | Add/remove bookmark |

### Example: List Posts with Filters

```bash
GET /api/blog/posts/?p=1&page_size=12&search=django&categories=tecnologia&feed=following
Authorization: JWT <access_token>
```

Response:

```json
{
  "results": [
    {
      "id": "...",
      "title": "...",
      "view_count": 42,
      "likes_count": 5,
      "comments_count": 3,
      "has_liked": false,
      "user": { "username": "...", "profile_picture": "..." },
      "category": { "name": "Tecnología", "slug": "tecnologia" }
    }
  ],
  "count": 100,
  "next": "http://...?p=2",
  "previous": null
}
```

---

## Installation & Setup

### Prerequisites

- **Docker** and **Docker Compose** (recommended), or
- **Node.js 18+**, **Python 3.11+**, **PostgreSQL**, **Redis** (local dev)

### Clone Repository

```bash
git clone https://github.com/your-username/fullstack-django-nextjs.git
cd fullstack-django-nextjs
```

### Option A: Docker (Recommended)

1. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `SECRET_KEY` (generate with `python -c "import secrets; print(secrets.token_urlsafe(50))"`).

2. **Start all services:**

   ```bash
   npm run docker:up
   ```

3. **Apply migrations and create superuser:**

   ```bash
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py createsuperuser
   ```

4. **Open in browser:**
   - Frontend: **http://localhost:3006**
   - Backend API: **http://localhost:7000**
   - Mailpit (emails): **http://localhost:8025**

### Option B: Local Development (No Docker)

1. **Backend:**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate   # Windows: .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

   Create `backend/.env` with database and Redis settings (see [Environment Variables](#environment-variables)).

   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

2. **Frontend:**

   ```bash
   cd frontend
   npm install
   ```

   Create `frontend/.env.local`:

   ```
   API_URL=http://localhost:8000
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   ```bash
   npm run dev
   ```

3. **Run both from root (optional):**

   ```bash
   npm run dev
   ```

   Backend: **http://localhost:8000** | Frontend: **http://localhost:3000**

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret | `your-secret-key` |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Allowed hosts | `localhost,127.0.0.1,backend` |
| `DATABASE_HOST` | DB host | `postgres` (Docker) / `127.0.0.1` (local) |
| `DATABASE_PORT` | DB port | `5432` |
| `DATABASE_NAME` | DB name | `django_db` |
| `DATABASE_USER` | DB user | `django` |
| `DATABASE_PASSWORD` | DB password | `postgres` |
| `REDIS_HOST` | Redis host | `redis` (Docker) / `localhost` |
| `REDIS_URL` | Redis URL | `redis://redis:6379/0` |
| `USE_REDIS` | Enable Redis cache | `true` |
| `CORS_ORIGIN_WHITELIST` | CORS origins | `http://localhost:3000,http://localhost:3006` |
| `API_URL` | Backend URL (Next.js) | `http://localhost:7000` |
| `NEXT_PUBLIC_API_URL` | Backend URL (browser) | `http://localhost:7000` |

---

## Testing

- **Frontend:** `npm run lint` (ESLint), `npm run format` (Prettier)
- **Backend:** Unit tests with pytest (planned); manual testing via Django admin and API

---

## Deployment

- **Docker Compose** for staging/production (adjust `DEBUG`, `ALLOWED_HOSTS`, `CORS`)
- **Production recommendations:**
  - Use Gunicorn/Uvicorn behind Nginx
  - PostgreSQL managed (e.g. AWS RDS, Supabase)
  - Redis managed (e.g. ElastiCache, Upstash)
  - Static files: WhiteNoise or CDN (S3 + CloudFront)
  - Email: Resend, SendGrid, or AWS SES

---

## Performance & Scalability Considerations

| Decision | Rationale |
|----------|-----------|
| **Bulk impression update** | Single `UPDATE ... SET impressions = impressions + 1` for N posts instead of N queries |
| **Redis cache for dedup** | O(1) lookup; 24h TTL avoids unbounded growth |
| **`select_related` / `prefetch_related`** | Reduces N+1 queries on list endpoints |
| **Pagination** | Cursor/page-based to avoid loading full datasets |
| **Next.js API routes as BFF** | Single origin for browser, auth forwarding, future server-side caching |
| **Django Channels + Redis** | Horizontal scaling of WebSocket workers |

---

## Future Improvements

- [ ] Unit and E2E tests (pytest, Playwright)
- [ ] Rate limiting on API endpoints
- [ ] SEO: Open Graph, meta tags, sitemap
- [ ] CI/CD with GitHub Actions
- [ ] Real-time notifications via WebSockets
- [ ] Image optimization (WebP, lazy loading)
- [ ] i18n (internationalization)

---

## About the Developer

Built as a portfolio project to demonstrate full-stack capabilities, Clean Architecture, and production-ready patterns. The codebase prioritizes maintainability, testability, and scalability.

---

## License

MIT License — see [LICENSE](LICENSE) for details.
