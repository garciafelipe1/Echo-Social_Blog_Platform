import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parseCookies(req.headers.cookie || '');
  const accessToken = cookies.access;

  if (!accessToken) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }

  const baseUrl = getBackendUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `JWT ${accessToken}`,
  };

  try {
    if (req.method === 'POST') {
      const apiRes = await fetch(`${baseUrl}/api/blog/post/comment/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json(data);
    }

    if (req.method === 'PUT') {
      const apiRes = await fetch(`${baseUrl}/api/blog/post/comment/`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json(data);
    }

    if (req.method === 'DELETE') {
      const commentId = req.query.comment_id as string;
      const apiRes = await fetch(
        `${baseUrl}/api/blog/post/comment/?comment_id=${encodeURIComponent(commentId)}`,
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
