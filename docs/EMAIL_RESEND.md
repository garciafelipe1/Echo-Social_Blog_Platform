# Configurar Resend para emails (login, registro, OTP)

Resend permite enviar emails reales para activación de cuenta, login OTP, reset de contraseña, etc.

Los emails usan la marca **EF** (configurable con `SITE_NAME` en `backend/.env`).

---

## Pruebas locales (sin dominio)

**No necesitas verificar ningún dominio.** Resend incluye `onboarding@resend.dev` para pruebas:

1. Crea cuenta en [resend.com](https://resend.com)
2. Crea una API key en [resend.com/api-keys](https://resend.com/api-keys) (clic en "Create API Key", copia la clave que empieza por `re_`)
3. Añade en tu `.env`:
   - **Con Docker:** `.env` en la raíz del proyecto
   - **Local (sin Docker):** `backend/.env`
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   FRONTEND_URL=http://localhost:3000
   ```
4. Reinicia el backend

Los emails se enviarán desde `onboarding@resend.dev` y llegarán a tu bandeja de entrada (revisa spam si no los ves). No hace falta configurar `RESEND_FROM_EMAIL`.

---

## Producción (con tu dominio)

Para enviar desde `noreply@tudominio.com`:

1. Ve a [resend.com/domains](https://resend.com/domains)
2. Añade tu dominio (ej: `echo.dev`, `miapp.com`)
3. Añade los registros DNS que Resend te indique (TXT, MX, etc.)
4. Espera a que el dominio pase a "Verified"
5. Añade en tu `.env`:
   ```env
   RESEND_FROM_EMAIL=Echo <noreply@tudominio.com>
   FRONTEND_URL=https://tu-app.com
   ```

---

## Reiniciar el backend

```bash
# Con Docker
docker compose restart backend

# Local
# Detén el servidor (Ctrl+C) y vuelve a ejecutar:
cd backend
python manage.py runserver
```

---

## Probar

1. **Registro:** Crea una cuenta nueva → deberías recibir el email de activación
2. **Login OTP:** Introduce tu email → deberías recibir el código OTP
3. **Reset password:** Usa "Olvidé mi contraseña" → deberías recibir el enlace

---

## Emails que usa el proyecto

| Flujo        | Plantilla                          | Cuándo se envía          |
|-------------|-------------------------------------|---------------------------|
| Activación  | `email/auth/activation.html`        | Tras registrarse          |
| Login OTP   | `email/auth/otp_login.html`          | Al solicitar código OTP   |
| Reset pass  | `email/auth/password_reset.html`     | Olvidé contraseña         |
| Confirmación| `email/auth/password_changed_confirmation.html` | Tras cambiar contraseña |

---

## Desactivar Resend (volver a desarrollo)

Para volver a guardar emails en archivos (sin enviar):

1. Elimina o comenta `RESEND_API_KEY` en tu `.env`
2. Reinicia el backend

Los emails se guardarán en `backend/emails/` (o en Mailpit si usas Docker con esa config).

---

## Puertos SMTP (opcional)

Por defecto Resend usa el puerto **465** (SSL). Si tienes problemas, prueba el **587** (TLS):

```env
RESEND_SMTP_PORT=587
```
