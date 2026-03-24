import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  if (!process.env.API_URL) {
    return res.status(500).json({
      error: 'API_URL no configurada. Crea frontend/.env.local con API_URL=http://localhost:7000',
    });
  }

  try {
    const apiRes = await fetch(
      `${process.env.API_URL.replace(/\/$/, '')}/api/authentication/send_otp_login/`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      },
    );

    let data: Record<string, unknown>;
    const contentType = apiRes.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await apiRes.json();
    } else {
      const text = await apiRes.text();
      return res.status(apiRes.status).json({
        error: apiRes.ok
          ? 'Respuesta inesperada del backend'
          : `Error ${apiRes.status}: ${text.slice(0, 200)}`,
      });
    }
    return res.status(apiRes.status).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error de conexión';
    return res.status(500).json({
      error: `No se pudo conectar con el backend. ¿Está corriendo en ${process.env.API_URL}? ${message}`,
    });
  }
}
