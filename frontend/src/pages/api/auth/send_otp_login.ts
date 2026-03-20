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
    const apiRes = await fetch(`${process.env.API_URL.replace(/\/$/, '')}/api/authentication/send_otp_login/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
