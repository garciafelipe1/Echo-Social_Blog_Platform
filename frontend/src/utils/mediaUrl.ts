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

export function avatarFallbackUrl(username?: string | null): string {
  const name = (username || 'User').trim() || 'User';
  const bg = '0ea5e9';
  const color = 'ffffff';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${color}&size=256&bold=true&format=png`;
}

export function postImageFallbackUrl(seed?: string | null): string {
  const s = (seed || 'post').trim() || 'post';
  // Picsum soporta seed estable para que siempre salga la misma imagen por post.
  return `https://picsum.photos/seed/${encodeURIComponent(s)}/1200/675`;
}
