import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { slug } = req.query;

  try {
    const baseUrl = getBackendUrl();
    const cookies = parseCookies(req.headers.cookie || '');
    const accessToken = cookies.access;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `JWT ${accessToken}`;
    }

    const apiRes = await fetch(`${baseUrl}/api/blog/post/get/?slug=${slug}`, {
      method: 'GET',
      headers,
    });

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch {
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
