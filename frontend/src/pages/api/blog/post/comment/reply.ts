import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const accessToken = cookies.access;

  if (!accessToken) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }

  try {
    const baseUrl = getBackendUrl();
    const apiRes = await fetch(`${baseUrl}/api/blog/post/comment/reply/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `JWT ${accessToken}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await apiRes.json().catch(() => ({}));
    return res.status(apiRes.status).json(data);
  } catch {
    return res.status(500).json({ error: 'Backend request failed' });
  }
}
