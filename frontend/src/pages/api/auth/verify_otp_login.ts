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

  const { email, otp } = req.body || {};
  if (!email || !otp) {
    return res.status(400).json({
      error: 'Email y código OTP son requeridos.',
    });
  }

  if (!process.env.API_URL) {
    return res.status(500).json({
      error: 'API_URL no configurada. Revisa frontend/.env.local',
    });
  }

  try {
    const apiRes = await fetch(`${process.env.API_URL}/api/authentication/verify_otp_login/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: String(email).trim(), otp: String(otp).trim() }),
    });

    let data: Record<string, unknown> = {};
    try {
      data = await apiRes.json();
    } catch {
      return res.status(apiRes.status).json({
        error: apiRes.status === 400 ? 'Código OTP inválido o expirado.' : 'Error del servidor.',
      });
    }

    if (apiRes.status === 200) {
      const tokens = (data.results || data) as { access?: string; refresh?: string };
      const { access, refresh } = tokens;
      if (access && refresh) {
        res.setHeader('Set-Cookie', [
          `access=${access}; HttpOnly; Path=/; SameSite=Strict; Secure=${process.env.NODE_ENV === 'production' ? 'true' : 'false'}; Max-Age=2592000`,
          `refresh=${refresh}; HttpOnly; Path=/; SameSite=Strict; Secure=${process.env.NODE_ENV === 'production' ? 'true' : 'false'}; Max-Age=5184000`,
        ]);
      }
    }

    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
