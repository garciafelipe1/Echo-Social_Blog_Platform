import buildQueryString from '@/utils/BuildQueryString';
import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }
  const cookies = parseCookies(req.headers.cookie || '');
  const accessToken = cookies.access;

  if (!accessToken) {
    return res.status(401).json({ error: 'Debes iniciar sesión para ver tus posts.' });
  }

  try {
    const baseUrl = getBackendUrl();
    const apiRes = await fetch(
      `${baseUrl}/api/blog/post/author/list/?${buildQueryString(req.query)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `JWT ${accessToken}`,
        },
      },
    );

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
