# Desplegar en Railway (Frontend y Backend separados)

Guía para desplegar EF en Railway con **backend** y **frontend** como servicios independientes.

---

## Requisitos

- Cuenta en [Railway](https://railway.app)
- Repositorio en GitHub (o conecta tu repo)

---

## 1. Crear el proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. **New Project** → **Deploy from GitHub repo**
3. Conecta tu repositorio y selecciona el que contiene el proyecto

---

## 2. Servicio Backend (Django)

### Crear el servicio

1. En tu proyecto Railway, clic en **+ New** → **GitHub Repo**
2. Selecciona el mismo repositorio
3. En **Settings** del servicio:
   - **Root Directory**: `backend`
   - **Build Command**: (vacío, usa Nixpacks por defecto)
   - **Start Command**: (vacío, usa Procfile)

### Añadir PostgreSQL

1. En el mismo proyecto, **+ New** → **Database** → **PostgreSQL**
2. Railway crea la base de datos y expone `DATABASE_URL`
3. En el servicio **backend**, **Variables** → **Add Variable Reference**:
   - Añade `DATABASE_URL` desde el servicio PostgreSQL (clic en "Add Reference")

### Variables de entorno del Backend

En **Variables** del servicio backend, añade:

| Variable | Valor | Notas |
|----------|-------|-------|
| `SECRET_KEY` | Una clave segura (50+ caracteres) | Genera con `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DEBUG` | `False` | Obligatorio en producción |
| `ALLOWED_HOSTS` | `*` o tu dominio | Ej: `*.railway.app,tudominio.com` |
| `FRONTEND_URL` | URL del frontend | Ej: `https://tu-frontend.up.railway.app` |
| `CORS_ORIGIN_WHITELIST` | URL del frontend | Mismo que FRONTEND_URL |
| `CSRF_TRUSTED_ORIGINS` | URL del frontend | Mismo que FRONTEND_URL |
| `SITE_NAME` | `EF` | Nombre de la app |
| `USE_REDIS` | `false` | Si no añades Redis |
| `RESEND_API_KEY` | Tu API key de Resend | Para emails |
| `RESEND_FROM_EMAIL` | `EF <onboarding@resend.dev>` | O tu dominio verificado |

Si añades **Redis** en Railway, referencia `REDIS_URL` y pon `USE_REDIS=true`.

### Dominio público

1. En el servicio backend → **Settings** → **Networking**
2. **Generate Domain** para obtener la URL pública (ej: `backend-production-xxx.up.railway.app`)
3. Guarda esta URL; la usarás en el frontend como `API_URL` y `NEXT_PUBLIC_API_URL`

---

## 3. Servicio Frontend (Next.js)

### Crear el servicio

1. **+ New** → **GitHub Repo** (mismo repositorio)
2. En **Settings**:
   - **Root Directory**: `frontend`

### Variables de entorno del Frontend

| Variable | Valor | Notas |
|----------|-------|-------|
| `API_URL` | URL pública del backend | Ej: `https://backend-production-xxx.up.railway.app` |
| `NEXT_PUBLIC_API_URL` | Mismo que API_URL | Para imágenes y fetch desde el cliente |

**Importante:** `NEXT_PUBLIC_API_URL` se incrusta en el build. Si cambias el backend, hay que redesplegar el frontend.

### Dominio público

1. En el servicio frontend → **Settings** → **Networking**
2. **Generate Domain**
3. Copia la URL y añádela en el backend como `FRONTEND_URL`, `CORS_ORIGIN_WHITELIST` y `CSRF_TRUSTED_ORIGINS`

---

## 4. Orden de despliegue

1. Despliega primero el **backend** (con PostgreSQL)
2. Copia la URL pública del backend
3. Añade en el **frontend** las variables `API_URL` y `NEXT_PUBLIC_API_URL` con esa URL
4. Despliega el **frontend**
5. Copia la URL del frontend y actualiza en el **backend** `FRONTEND_URL`, CORS y CSRF
6. Redeploy del backend para aplicar los cambios

---

## 5. Archivos de media (imágenes)

Las imágenes de perfil, posts, etc. se sirven desde el backend (`/media/`). En Railway no hay volumen persistente por defecto. Opciones:

- **Railway Volumes**: Añade un Volume al backend y monta en `media/` (requiere cambios en el Dockerfile/settings)
- **Storage externo**: Usar S3, Cloudflare R2, etc. y configurar `DEFAULT_FILE_STORAGE` en Django

Para pruebas rápidas, las imágenes se guardan en el disco efímero; se pierden al redeploy.

---

## 6. Verificar

1. Abre la URL del frontend
2. Prueba registro, login, crear post
3. Revisa los logs en Railway si algo falla

---

## 7. Comandos útiles

```bash
# Crear superusuario (desde tu máquina con Railway CLI)
railway run python manage.py createsuperuser

# Actualizar dominio del Site para emails
railway run python manage.py set_site_domain
```

---

## Estructura del repo para Railway

```
tu-repo/
├── backend/           ← Root Directory del servicio backend
│   ├── Procfile
│   ├── nixpacks.toml
│   ├── railway.json
│   ├── requirements.txt
│   ├── manage.py
│   └── core/
├── frontend/           ← Root Directory del servicio frontend
│   ├── package.json
│   ├── railway.json
│   └── src/
└── docs/
```

Cada servicio usa su carpeta como raíz; no es necesario separar en repos distintos.
