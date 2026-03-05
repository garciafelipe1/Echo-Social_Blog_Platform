import type { NextApiRequest, NextApiResponse } from 'next';

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function isValidPayload(body: unknown): body is ContactPayload {
  if (typeof body !== 'object' || body === null) return false;
  const { name, email, subject, message } = body as Record<string, unknown>;
  return [name, email, subject, message].every((v) => typeof v === 'string' && v.trim().length > 0);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!isValidPayload(req.body)) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const { name, email, subject, message } = req.body;

  // TODO: Conectar con servicio de email (Resend, SendGrid, etc.) o guardar en BD

  return res.status(200).json({ message: 'Mensaje recibido correctamente.' });
}
