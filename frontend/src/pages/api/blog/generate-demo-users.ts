import type { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '@/pages/api/_lib/backendFetch';

/**
 * Proxy GET al endpoint del backend que crea usuarios de prueba (demo1, demo2, …).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseUrl = getBackendUrl();
    const apiRes = await fetch(`${baseUrl}/api/blog/generate_demo_users/`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const contentType = apiRes.headers.get('content-type');
    let data: Record<string, unknown> = {};
    if (contentType?.includes('application/json')) {
      data = await apiRes.json().catch(() => ({}));
    } else {
      const text = await apiRes.text();
      data = { response: text || 'Error del servidor' };
    }
    return res.status(apiRes.status).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al generar usuarios';
    return res.status(500).json({ error: message });
  }
}
