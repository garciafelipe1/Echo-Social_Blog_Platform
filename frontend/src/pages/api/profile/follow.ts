import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parseCookies(req.headers.cookie || '');
  const accessToken = cookies.access;

  if (!accessToken) {
    return res.status(401).json({ error: 'Debes iniciar sesion' });
  }

  const baseUrl = getBackendUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `JWT ${accessToken}`,
  };

  try {
    if (req.method === 'POST') {
      const apiRes = await fetch(`${baseUrl}/api/profile/follow/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json(data);
    }

    if (req.method === 'DELETE') {
      const username = req.query.username as string;
      const apiRes = await fetch(
        `${baseUrl}/api/profile/follow/?username=${encodeURIComponent(username)}`,
        { method: 'DELETE', headers },
      );
      const data = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json(data);
    }

    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch {
    return res.status(500).json({ error: 'Backend request failed' });
  }
}
