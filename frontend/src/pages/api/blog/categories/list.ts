import buildQueryString from '@/utils/BuildQueryString';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  const baseUrl = process.env.API_URL?.replace(/\/$/, '') || '';
  if (!baseUrl) {
    return res.status(503).json({
      error: 'API_URL no configurada. Añade API_URL=http://localhost:7000 en frontend/.env.local',
    });
  }

  try {
    const apiRes = await fetch(`${baseUrl}/api/blog/categories/?${buildQueryString(req.query)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const contentType = apiRes.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await apiRes.json()
      : { error: 'Backend returned non-JSON' };
    return res.status(apiRes.status).json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error de conexión';
    return res.status(500).json({
      error: 'No se pudo conectar con el backend',
      detail: process.env.NODE_ENV === 'development' ? msg : undefined,
    });
  }
}
