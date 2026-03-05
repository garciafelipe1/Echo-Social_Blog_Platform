import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const accessToken = cookies.access;

  if (!accessToken) {
    return res.status(401).json({ error: 'Debes iniciar sesión para registrar el compartido' });
  }

  const { slug, plataform = 'other' } = req.body ?? {};
  if (!slug) {
    return res.status(400).json({ error: 'slug es requerido' });
  }

  try {
    const baseUrl = getBackendUrl();
    const apiRes = await fetch(`${baseUrl}/api/blog/post/share/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `JWT ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slug, plataform: String(plataform).toLowerCase() }),
    });

    const data = await apiRes.json().catch(() => ({}));
    return res.status(apiRes.status).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Backend no disponible';
    return res.status(503).json({ error: 'Backend no disponible', detail: message });
  }
}
