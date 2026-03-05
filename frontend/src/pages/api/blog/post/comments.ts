import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';
import buildQueryString from '@/utils/BuildQueryString';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const baseUrl = getBackendUrl();
    const cookies = parseCookies(req.headers.cookie || '');
    const accessToken = cookies.access;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `JWT ${accessToken}`;
    }

    const apiRes = await fetch(
      `${baseUrl}/api/blog/post/comments/?${buildQueryString(req.query)}`,
      { method: 'GET', headers },
    );

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch {
    return res.status(500).json({ error: 'Backend request failed' });
  }
}
