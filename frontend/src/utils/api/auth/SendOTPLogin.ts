import { ToastError } from '@/components/toast/toast';

export interface SendOTPLoginProps {
  email: string;
}

export default async function sendOTPLogin(props: SendOTPLoginProps) {
  try {
    const res = await fetch('/api/auth/send_otp_login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: props.email,
      }),
    });

    if (!res) {
      console.error('Error: La respuesta del servidor es null.');
      ToastError('Error al enviar el correo.');
      return null;
    }

    const data = await res.json();

    if (res.status === 200) {
      return { ok: true, data };
    } else {
      const errMsg = (data as { error?: string })?.error || 'Error al enviar el correo.';
      ToastError(errMsg);
      return { ok: false, error: errMsg };
    }
  } catch (err) {
    ToastError('Error al enviar el correo.');
    return { ok: false, error: 'Error de conexión' };
  }
}
