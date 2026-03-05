import { useState } from 'react';
import { ToastError, ToastSuccess } from '@/components/toast/toast';

export default function GenerateDemoUsersButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blog/generate-demo-users');
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        ToastSuccess(data?.message ?? data?.response ?? 'Usuarios de prueba creados.');
      } else {
        const msg = data?.response ?? data?.error ?? data?.detail ?? data?.message ?? 'Error al generar usuarios';
        ToastError(typeof msg === 'string' ? msg : 'Error al generar usuarios');
      }
    } catch {
      ToastError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-xl border border-violet-600 bg-white px-5 py-2.5 text-sm font-medium text-violet-600 shadow-sm hover:bg-violet-50 disabled:opacity-60"
    >
      {loading ? 'Creando…' : 'Generar usuarios de prueba'}
    </button>
  );
}
