import { useState } from 'react';
import { ToastError, ToastSuccess } from '@/components/toast/toast';

interface Props {
  onSuccess: () => void;
}

export default function GenerateDemoPostsButton({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blog/generate-post');
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        ToastSuccess(data?.message || data?.response || 'Posts de prueba generados. Recargando…');
        onSuccess();
      } else {
        const msg = data?.response ?? data?.error ?? data?.detail ?? data?.message ?? 'Error al generar posts';
        ToastError(typeof msg === 'string' ? msg : 'Error al generar posts');
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
      className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:opacity-60"
    >
      {loading ? 'Generando…' : 'Generar posts de prueba (imagen + fechas)'}
    </button>
  );
}
