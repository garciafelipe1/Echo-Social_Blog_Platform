import Button from '@/components/Button';
import EditEmail from '@/components/forms/EditEmail';
import EditPassword from '@/components/forms/EditPassword';

import Layout from '@/hocs/Layout';
import { useState } from 'react';

import { UnknownAction } from 'redux';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import LoadingMoon from '@/components/loaders/LoadingMoon';
import Link from 'next/link';
import {
  loadProfile,
  loadUser,
  login,
  refresh_access_token,
  setLoginSuccess,
  verify_access_token,
} from '@/redux/actions/auth/actions';
import { ILoginProps } from '@/redux/actions/auth/interfaces';
import sendOTPLogin, { SendOTPLoginProps } from '@/utils/api/auth/SendOTPLogin';
import { ToastError, ToastSuccess } from '@/components/toast/toast';
import EditText from '@/components/forms/EditText';
import verifyOTPLogin, { SendVerifyOTPLoginProps } from '@/utils/api/auth/VerifyOTPlogin';
import { useRouter } from 'next/router';

export default function Page() {
  const [email, setEmail] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [otp, setOTP] = useState<string>('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [showResendActivation, setShowResendActivation] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ToastError('Introduce un email válido');
      return;
    }

    const sendOTPLoginData: SendOTPLoginProps = {
      email,
    };

    try {
      setLoading(true);
      setDevOtp(null);
      setShowResendActivation(false);
      const res = await sendOTPLogin(sendOTPLoginData);
      if (res?.ok && res.data) {
        setStep(2);
        const otpFromApi = res.data.dev_otp ?? res.data.results?.dev_otp;
        if (otpFromApi) {
          setDevOtp(otpFromApi);
          setOTP(otpFromApi);
        }
      } else {
        setEmail('');
        const err = (res as { error?: string })?.error || '';
        if (/not active|activar|activation/i.test(err)) {
          setShowResendActivation(true);
        }
      }
    } catch (err) {
      ToastError(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const handleResendOTP = async () => {
    if (!email.trim()) return;
    try {
      setLoading(true);
      setDevOtp(null);
      const res = await sendOTPLogin({ email });
      if (res?.ok && res.data) {
        ToastSuccess('Código reenviado. Revisa tu correo.');
        const otpFromApi = res.data.dev_otp ?? res.data.results?.dev_otp;
        if (otpFromApi) {
          setDevOtp(otpFromApi);
          setOTP(otpFromApi);
        }
      }
    } catch (err) {
      ToastError(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const sendVerifyOTPLoginData: SendVerifyOTPLoginProps = {
      email,
      otp,
    };

    try {
      setLoading(true);
      const res = await verifyOTPLogin(sendVerifyOTPLoginData);
      if (res && res.status === 200) {
        await dispatch(loadUser());
        await dispatch(loadProfile());
        await dispatch(setLoginSuccess());

        ToastSuccess('¡Sesión iniciada correctamente!');

        router.push('/');
      } else if (res === null) {
        setEmail('');
        setOTP('');
      }
    } catch (err) {
      ToastError(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 pt-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="dark:text-dark-txt mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Accede a tu cuenta
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {step === 1 && (
          <>
            <form onSubmit={handleOnSubmit} className="space-y-2">
              <EditEmail data={email} setData={setEmail} title="Email" required />
              <Button disabled={loading} hoverEffect={!loading} type="submit">
                {loading ? <LoadingMoon /> : 'Iniciar sesión'}
              </Button>
            </form>
            {showResendActivation && (
              <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 px-3 py-3 text-center text-sm dark:border-violet-800 dark:bg-violet-950/40">
                <p className="text-violet-800 dark:text-violet-200">
                  Tu cuenta no está activada. Revisa tu correo o reenvía el enlace.
                </p>
                <Link
                  href={
                    email
                      ? `/resend-activation?email=${encodeURIComponent(email)}`
                      : '/resend-activation'
                  }
                  className="mt-2 inline-block rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
                >
                  Reenviar correo de activación
                </Link>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <form onSubmit={handleOTPSubmit} className="space-y-2">
              <EditText
                data={otp}
                setData={(v) => setOTP(v.replace(/\D/g, '').slice(0, 6))}
                title="Código OTP"
                required
                description="Solo números, 6 dígitos. El código expira en 90 segundos."
              />
              <Button disabled={loading} hoverEffect={!loading} type="submit">
                {loading ? <LoadingMoon /> : 'Iniciar sesión'}
              </Button>
            </form>
            <div className="mt-4 space-y-2 text-center text-sm text-gray-500">
              <p>
                ¿No recibiste el código?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="font-semibold text-violet-600 hover:text-violet-500 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reenviar código
                </button>
              </p>
              <p>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setDevOtp(null);
                    setOTP('');
                  }}
                  disabled={loading}
                  className="font-semibold text-violet-600 hover:text-violet-500 hover:underline disabled:opacity-50"
                >
                  Usar otro email
                </button>
              </p>
              {devOtp && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                  <span className="font-medium">Desarrollo:</span> Tu código es{' '}
                  <strong>{devOtp}</strong>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-10 space-y-2">
          <p className="text-center text-sm/6 text-gray-500">
            ¿No activaste tu cuenta?{' '}
            <Link
              href="/resend-activation"
              className="font-semibold text-violet-600 hover:text-violet-500"
            >
              Reenviar correo de activación
            </Link>
          </p>
          <p className="text-center text-sm/6 text-gray-500">
            No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-violet-600 hover:text-violet-500">
              Regístrate
            </Link>
          </p>
          <p className="text-center text-sm/6 text-gray-500">
            Olvidaste tu contraseña?{' '}
            <Link
              href="/forgot-password"
              className="font-semibold text-violet-600 hover:text-violet-500"
            >
              Olvidé mi contraseña
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
