# Roadmap de mejoras — Echo

## Completadas (sesión actual)

1. **Compartir posts** — ShareButton conectado con backend PostShare
2. **Typo** — `pasive` → `passive` corregido
3. **FeedComposer** — Sin reload; actualiza feed vía `onPostCreated`
4. **FeedComposer** — Categorías reales (selector de categoría)
5. **SEO** — Meta tags y Open Graph en posts, index, blog
6. **WebSocket** — `NEXT_PUBLIC_WS_URL` documentado en `.env.example`
7. **Rate limiting** — Ya estaba en Django (30/min anónimo, 120/min usuario)
8. **Imágenes** — WebP/AVIF habilitados en `next.config.ts`
9. **Tests** — Estructura pytest en `backend/apps/blog/tests/`

## Pendientes / próximos pasos

### 10. Internacionalización (i18n)

- Instalar `next-intl` o `react-i18next`
- Crear archivos de traducción (`es.json`, `en.json`)
- Envolver strings en `t()` o `useTranslations()`
- Configurar detección de idioma y selector

### 11. Repost / Citar post (estilo retweet)

- **Backend**: Modelo `PostRepost` (user, post, optional_comment)
- Endpoint `POST /api/blog/post/repost/` con `post_slug` y `comment?`
- Incluir reposts en el feed (o pestaña dedicada)
- **Frontend**: Botón "Repost" / "Citar" en PostCard y PostDetail

### 12. Tendencias / Hashtags

- **Backend**: Modelo `Hashtag` y `PostHashtag` (M2M)
- Parsear `#tag` en el contenido al crear/editar post
- Endpoint `GET /api/blog/hashtags/trending/`
- Página `/explore/tags` o búsqueda por hashtag
