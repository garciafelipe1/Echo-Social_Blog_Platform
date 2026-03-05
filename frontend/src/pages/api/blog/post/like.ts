import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const accessToken = cookies.access;

  if (!accessToken) {
    return res.status(401).json({ error: 'Debes iniciar sesión para dar like' });
  }

  try {
    const baseUrl = getBackendUrl();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `JWT ${accessToken}`,
    };

    if (req.method === 'POST') {
      const { slug } = req.body ?? {};
      if (!slug) return res.status(400).json({ error: 'slug es requerido' });

      const apiRes = await fetch(`${baseUrl}/api/blog/post/like/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      const data = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json(data);
    }

    if (req.method === 'DELETE') {
      const slug = req.query.slug as string;
      if (!slug) return res.status(400).json({ error: 'slug es requerido' });

      const apiRes = await fetch(`${baseUrl}/api/blog/post/like/?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers,
      });

      const data = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json(data);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Backend no disponible';
    return res.status(503).json({ error: 'Backend no disponible', detail: message });
  }
}
