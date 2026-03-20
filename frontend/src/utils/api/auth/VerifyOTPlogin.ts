import { ToastError } from '@/components/toast/toast';

export interface SendVerifyOTPLoginProps {
  email: string;
  otp: string;
}

export default async function verifyOTPLogin(props: SendVerifyOTPLoginProps) {
  const email = String(props.email || '').trim();
  const otp = String(props.otp || '').trim();

  if (!email || !otp) {
    ToastError('Email y código OTP son requeridos.');
    return null;
  }

  try {
    const res = await fetch('/api/auth/verify_otp_login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    let data: Record<string, unknown> = {};
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      // Respuesta sin JSON (ej. 400 con body vacío)
    }

    if (res.ok) {
      return { ...data, status: res.status };
    }
    const d = data as { error?: string; message?: string; detail?: string; results?: string };
    const errMsg =
      d?.error || d?.message || (typeof d?.results === 'string' ? d.results : null) || d?.detail || 'Código OTP inválido o expirado. Solicita uno nuevo.';
    ToastError(errMsg);
  } catch (err) {
    ToastError('Error al verificar el código. Inténtalo de nuevo.');
  }

  return null;
}
