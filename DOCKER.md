# Levantar todo el proyecto con Docker

Con un solo comando puedes tener el **frontend**, **backend**, **PostgreSQL** y **Redis** en marcha. Es la forma recomendada para desarrollar: ambos servicios se levantan juntos.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose (v2)

## Primera vez

1. **Crea el archivo de entorno** en la raíz del proyecto:

   ```bash
   cp .env.example .env
   ```
   Revisa y ajusta `.env` si hace falta (SECRET_KEY, contraseñas, etc.).

2. **Levanta todos los servicios** desde la raíz:

   ```bash
   npm run docker:up
   ```
   o directamente:
   ```bash
   docker compose up -d --build
   ```

3. **Aplicar migraciones y crear superusuario** (solo la primera vez):

   ```bash
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py createsuperuser
   ```

4. Abre en el navegador:
   - **Frontend:** http://localhost:3006  
   - **Backend API:** http://localhost:7000  

## Comandos útiles

| Acción              | Comando |
|---------------------|--------|
| Levantar todo       | `npm run docker:up` o `docker compose up -d` |
| Ver logs            | `npm run docker:logs` o `docker compose logs -f` |
| Parar todo          | `npm run docker:down` o `docker compose down` |
| Parar y borrar datos| `docker compose down -v` |
| Logs del backend    | `docker compose logs -f backend` |
| Logs del frontend   | `docker compose logs -f frontend` |
| Entrar al backend   | `docker compose exec backend bash` |
| Migraciones         | `docker compose exec backend python manage.py migrate` |

## Variables de entorno (`.env` en la raíz)

Un solo `.env` en la raíz alimenta a **backend** y **frontend** cuando levantas con Docker. Puedes basarte en `.env.example`.

**Backend (obligatorias para Docker):**
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ORIGIN_WHITELIST`, `CSRF_TRUSTED_ORIGINS`
- `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST=postgres`, `DATABASE_PORT=5432`
- `REDIS_HOST=redis`, `REDIS_URL=redis://redis:6379/0` (y opcional `USE_REDIS=true`)

**Frontend:**  
`API_URL` y `NEXT_PUBLIC_API_URL` se **sobreescriben** en `docker-compose.yml` (backend:8004 y localhost:7000). Puedes dejarlas en el `.env` o no; el compose tiene los valores correctos.

Si cambias puertos en el compose, ajusta en `.env` las URLs que los usen (CORS, CSRF, etc.).

## Ventajas de este setup

- Un solo `docker compose up` para front + back + DB + Redis.
- No hace falta tener Python ni Node instalados en tu máquina para probar.
- Mismo entorno para todo el equipo.
- La base de datos persiste en el volumen `postgres_data` (no se pierde al hacer `docker compose down`; sí con `down -v`).
