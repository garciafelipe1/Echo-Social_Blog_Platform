# GitHub Actions — Configuración

Este proyecto incluye un workflow de CI que se ejecuta en cada push y pull request.

## Qué hace el workflow

| Job | Descripción |
|-----|-------------|
| **Backend** | PostgreSQL + Redis como servicios → `manage.py check` → migraciones → tests |
| **Frontend** | Instala deps → ESLint → build de Next.js |

## Cómo activarlo

1. **Subí el repo a GitHub** (si aún no lo hiciste):
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

2. **Actualizá el badge del README** con tu usuario y repo:
   ```markdown
   [![CI](https://github.com/TU_USUARIO/TU_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/TU_USUARIO/TU_REPO/actions/workflows/ci.yml)
   ```
   Reemplazá `TU_USUARIO` y `TU_REPO` por los reales.

3. **El workflow corre solo** en cada push a `main`, `master` o `develop`, y en cada PR hacia esas ramas.

## Ver resultados

- **Actions** en GitHub: `https://github.com/TU_USUARIO/TU_REPO/actions`
- El badge en el README muestra el estado del último run.

## Fallos frecuentes

- **Backend: migraciones** → Revisá que todas las migraciones estén commiteadas.
- **Frontend: build** → Ejecutá `npm run build` localmente para reproducir.
- **Frontend: lint** → Ejecutá `npm run lint` y corregí errores.
