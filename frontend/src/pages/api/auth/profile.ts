import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

type Data = { name?: string; error?: string; hint?: string; detail?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const accessToken = cookies.access;

  if (accessToken === '') {
    return res.status(401).json({ error: 'User unauthorized to make this request' });
  }

  try {
    const baseUrl = getBackendUrl();
    const apiRes = await fetch(`${baseUrl}/api/profile/my_profile/`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `JWT ${accessToken}` },
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
