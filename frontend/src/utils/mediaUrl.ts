const BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Resuelve una URL de media del backend.
 * Si el path ya es absoluto (http/https), lo devuelve tal cual.
 * Si es relativo (/media/...), le antepone NEXT_PUBLIC_API_URL.
 */
export function mediaUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}
