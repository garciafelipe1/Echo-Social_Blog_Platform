# Clean Architecture — FullStack Django + Next.js

Este documento describe la **Clean Architecture** aplicada al proyecto: capas, dependencias y convenciones.

## Principios

- **Independencia de frameworks**: la lógica de negocio no depende de Django ni de Next.js.
- **Testabilidad**: los casos de uso dependen de abstracciones (puertos); en tests se inyectan mocks.
- **Independencia de la UI y de la base de datos**: se pueden cambiar adaptadores sin tocar el dominio ni los casos de uso.

## Capas

```
┌─────────────────────────────────────────────────────────────────┐
│  Presentation / API (adapters)                                   │
│  - Backend: Views, Serializers, URLs                             │
│  - Frontend: Pages, Components, Hooks                             │
└───────────────────────────────┬─────────────────────────────────┘
                                │ usa
┌───────────────────────────────▼─────────────────────────────────┐
│  Application (use cases)                                         │
│  - Orquestan flujos, dependen solo de puertos                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ depende de
┌───────────────────────────────▼─────────────────────────────────┐
│  Domain (entities, exceptions, ports)                             │
│  - Sin dependencias externas                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │ implementado por
┌───────────────────────────────▼─────────────────────────────────┐
│  Infrastructure (repositories, API client)                        │
│  - Django ORM, Redis, fetch, etc.                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend (Django)

### Estructura por app

Cada app puede organizarse en:

```
apps/<app_name>/
├── domain/                 # Núcleo: sin Django
│   ├── __init__.py
│   ├── exceptions.py       # Errores de dominio
│   └── ports.py           # Interfaces (ej. IPostRepository)
├── application/            # Casos de uso
│   ├── __init__.py
│   └── use_cases/
│       ├── __init__.py
│       ├── list_posts.py
│       ├── create_post.py
│       └── ...
├── infrastructure/         # Implementaciones (ORM, cache)
│   ├── __init__.py
│   └── repositories.py    # DjangoPostRepository, etc.
├── api/                    # Adaptadores HTTP
│   ├── __init__.py
│   └── dependencies.py    # Inyección: repos + use cases
├── models.py               # Django models (persistencia)
├── serializers.py          # DTOs / presentación
├── views.py                # Vistas delgadas que llaman use cases
└── urls.py
```

### Reglas

1. **Domain**: no importar `django`, `rest_framework` ni ningún framework. Solo tipos, excepciones y ABCs (puertos).
2. **Application**: importar solo `domain` y opcionalmente tipos. Los casos de uso reciben repositorios por constructor o parámetro.
3. **Infrastructure**: implementar los puertos definidos en `domain.ports` usando Django ORM, cache, Redis, etc.
4. **API (views)**: extraer parámetros del `request`, llamar al caso de uso, mapear excepciones de dominio a respuestas HTTP (p. ej. `PostNotFoundError` → 404) y serializar la respuesta.

### Ejemplo de flujo (Blog)

1. **View** (`views.py`): obtiene `slug` del request, llama a `get_post_by_slug_use_case.execute(slug)`, captura `PostNotFoundError` y devuelve 404 o 200 con el serializado.
2. **Use case** (`get_post_by_slug.py`): recibe `IPostRepository` en el constructor, llama a `repo.get_by_slug(slug)` y devuelve el post o lanza `PostNotFoundError`.
3. **Repository** (`infrastructure/repositories.py`): implementa `get_by_slug` con `Post.objects.get(slug=slug)` y lanza `PostNotFoundError` si no existe.
4. **Dependencies** (`api/dependencies.py`): instancia `DjangoPostRepository`, `GetPostBySlugUseCase(repo)` y expone `get_post_by_slug_use_case` para las vistas.

### Apps con estructura Clean

- **blog**: dominio, casos de uso, repositorios e integración en vistas ya aplicados (listar posts, obtener por slug, crear, actualizar, eliminar, listar categorías).
- **authentication** y **user_profile**: carpetas `domain`, `application`, `infrastructure` y `api` creadas; las vistas se pueden migrar gradualmente a casos de uso.

---

## Frontend (Next.js)

### Estructura en `src/`

```
src/
├── domain/                 # Entidades, errores (sin fetch ni React)
│   ├── index.ts
│   └── errors.ts
├── application/            # Casos de uso y puertos
│   ├── ports/              # Interfaces (ej. IBlogApiPort)
│   │   ├── blog.ts
│   │   └── index.ts
│   ├── use-cases/          # ListPostsUseCase, etc.
│   │   ├── list-posts.ts
│   │   └── index.ts
│   └── container.ts        # Wiring: adapters → use cases
├── infrastructure/         # Implementaciones (fetch)
│   └── api/
│       ├── BlogApiAdapter.ts
│       └── index.ts
├── components/             # Presentación (UI)
├── pages/                  # Rutas Next.js y API routes
├── hooks/                  # Hooks que usan use cases o adapters
├── redux/                  # Estado global (auth, etc.)
├── interfaces/             # Tipos (entidades/DTOs)
└── utils/                  # Helpers (buildQueryString, etc.)
```

### Reglas

1. **Domain**: solo tipos y errores; sin `fetch`, sin `window`, sin hooks de React.
2. **Application**: puertos (interfaces) y casos de uso que dependen de esos puertos. Sin llamadas directas a `fetch`; la infraestructura implementa los puertos.
3. **Infrastructure**: adapters que implementan los puertos (p. ej. `BlogApiAdapter` llama a `/api/blog/...` con `fetch`).
4. **Presentation (hooks, components, pages)**: usan el `container` para obtener los casos de uso (p. ej. `listPostsUseCase`) y no importan directamente los adapters ni `utils/api` para flujos ya migrados.

### Ejemplo de flujo (listar posts)

1. **Hook** (`usePosts`): llama a `listPostsUseCase.execute(params)` (inyectado desde `application/container.ts`).
2. **Use case** (`list-posts.ts`): recibe `IBlogApiPort` en el constructor y llama a `this.api.fetchPostList(params)`.
3. **Adapter** (`BlogApiAdapter`): implementa `fetchPostList` con `fetch('/api/blog/post/list/?...')` y devuelve `{ results, count, next, previous }`.
4. **Container** (`container.ts`): instancia `BlogApiAdapter` y `ListPostsUseCase(blogApi)` y exporta `listPostsUseCase`.

Los **API routes** de Next.js (`pages/api/...`) actúan como BFF y siguen siendo el punto de entrada al backend; la Clean Architecture en el frontend se aplica entre el cliente (hooks/componentes) y esas rutas.

---

## Migración gradual

- **Backend**: añadir nuevos flujos como casos de uso + repositorio; refactorizar vistas existentes cuando se toquen.
- **Frontend**: nuevos features usando `application/use-cases` + `infrastructure/api`; hooks existentes pueden seguir usando `utils/api` hasta que se migren.
- Mantener tests: los casos de uso se testean con mocks de los puertos (repositorios o `IBlogApiPort`).

---

## Referencias

- [The Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- Dependency rule: dependencias solo hacia dentro (presentation → application → domain; infrastructure → domain).
