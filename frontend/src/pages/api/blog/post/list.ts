import buildQueryString from '@/utils/BuildQueryString';
import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const baseUrl = getBackendUrl();
    const cookies = parseCookies(req.headers.cookie || '');
    const accessToken = cookies.access;
    const headers: Record<string, string> = { Accept: 'application/json' };
    // Solo enviar token cuando feed=following (requiere usuario); omitir para evitar 401 con token expirado
    const needsAuth = req.query?.feed === 'following';
    if (needsAuth && accessToken) {
      headers['Authorization'] = `JWT ${accessToken}`;
    }

    const apiRes = await fetch(`${baseUrl}/api/blog/posts/?${buildQueryString(req.query)}`, {
      method: 'GET',
      headers,
    });
    const contentType = apiRes.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await apiRes.json()
      : { error: 'Backend returned non-JSON' };
    return res.status(apiRes.status).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    if (message.includes('API_URL')) {
      return res.status(503).json({
        error: message,
        hint: 'Create frontend/.env.local with API_URL=http://localhost:8000 and run the Django backend.',
      });
    }
    return res.status(500).json({
      error: 'Backend request failed',
      detail: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
}
