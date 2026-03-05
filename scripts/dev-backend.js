/**
 * Arranca el backend Django usando el venv del proyecto.
 * Uso: node scripts/dev-backend.js (desde la raíz)
 */
const { spawn } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, '..', 'backend');
const isWin = process.platform === 'win32';
const python = isWin
  ? path.join(backendDir, 'venv', 'Scripts', 'python.exe')
  : path.join(backendDir, 'venv', 'bin', 'python');

const proc = spawn(python, ['manage.py', 'runserver'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: isWin,
});

proc.on('error', (err) => {
  console.error('No se pudo arrancar el backend. ¿Tienes el venv creado? (cd backend && python -m venv venv && pip install -r requirements.txt)');
  process.exit(1);
});
proc.on('exit', (code) => process.exit(code ?? 0));
