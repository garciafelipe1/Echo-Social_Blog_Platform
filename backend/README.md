# Backend Django

## Primer uso: entorno virtual

Las dependencias van en un **entorno virtual**. Si ves `ModuleNotFoundError: No module named 'django'`, es que no lo tienes activado.

### 1. Crear el entorno (solo la primera vez)

```powershell
cd backend
python -m venv venv
```

### 2. Activar el entorno

**PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**CMD:**
```cmd
venv\Scripts\activate.bat
```

Verás `(venv)` al inicio del prompt cuando esté activo.

### 3. Instalar dependencias (solo la primera vez, o al cambiar requirements.txt)

```powershell
pip install -r requirements.txt
```

### 4. Arrancar el servidor

Con el venv **activado**:

```powershell
python manage.py runserver
```

Servirá en http://127.0.0.1:8000

---

**Resumen:** cada vez que abras una terminal nueva para trabajar en el backend, activa el venv con `.\venv\Scripts\Activate.ps1` y luego `python manage.py runserver`.
