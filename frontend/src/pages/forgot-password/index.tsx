import Button from '@/components/Button';
import EditEmail from '@/components/forms/EditEmail';
import Layout from '@/hocs/Layout';
import { ReactElement } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import { ToastError } from '@/components/toast/toast';
import { forgot_password } from '@/redux/actions/auth/actions';

export default function Page() {
  const [email, setEmail] = useState<string>('');
  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ToastError('Introduce un email válido');
      return;
    }

    try {
      setLoading(true);
      await dispatch(forgot_password({ email }));
    } catch (err) {
      ToastError('Error al solicitar el restablecimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-32 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="dark:text-dark-txt mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Recuperar contraseña
        </h2>
        <p className="dark:text-dark-txt-secondary mt-2 text-center text-sm text-gray-500">
          Te enviaremos un enlace a tu correo para restablecer tu contraseña.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleOnSubmit} className="space-y-2">
          <EditEmail
            data={email}
            setData={setEmail}
            title="Email"
            placeholder="tu@email.com"
            required
          />
          <Button disabled={loading} hoverEffect={!loading} type="submit">
            {loading ? <LoadingMoon /> : 'Enviar enlace'}
          </Button>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          ¿Recordaste tu contraseña?{' '}
          <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-500">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
