import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Diagnóstico: prueba la conexión con el backend.
 * GET /api/health → muestra si API_URL está configurada y si el backend responde.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiUrl = process.env.API_URL?.replace(/\/$/, '') || '';
  const result: Record<string, unknown> = {
    api_url: apiUrl || '(no configurada)',
    backend_reachable: false,
    backend_status: null,
    error: null,
  };

  if (!apiUrl) {
    return res.status(200).json({
      ...result,
      error: 'API_URL no configurada. Añade API_URL=http://localhost:7000 en frontend/.env.local',
    });
  }

  try {
    const healthRes = await fetch(`${apiUrl}/api/health/`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    result.backend_reachable = true;
    result.backend_status = healthRes.status;
    result.backend_ok = healthRes.ok;
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return res.status(200).json(result);
}
