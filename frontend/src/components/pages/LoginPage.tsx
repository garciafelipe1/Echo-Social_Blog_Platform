import Button from '@/components/Button';
import EditEmail from '@/components/forms/EditEmail';
import EditPassword from '@/components/forms/EditPassword';

import Layout from '@/hocs/Layout';
import { ReactElement } from 'react';
import { useState } from 'react';

import { UnknownAction } from 'redux';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import LoadingMoon from '@/components/loaders/LoadingMoon';
import Link from 'next/link';
import { login, refresh_access_token, verify_access_token } from '@/redux/actions/auth/actions';
import { ILoginProps } from '@/redux/actions/auth/interfaces';

export default function Page() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const loginData: ILoginProps = {
      email,
      password,
    };

    try {
      setLoading(true);
      await dispatch(login(loginData));
    } catch (err) {
      // Error handled by Redux action
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    try {
      setLoading(true);
      await dispatch(refresh_access_token());
    } catch (err) {
      // Error handled by Redux action
    } finally {
      setLoading(false);
    }
  };
  // const handleVerifyToken = async () => {
  //   try {
  //     setLoading(true);
  //     await dispatch(verify_access_token());
  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //     setLoading(false);
  //   }

  // }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-32 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Accede a tu cuenta
        </h2>
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
          <EditPassword data={password} setData={setPassword} title="Contraseña" required />
          <Button disabled={loading} hoverEffect={!loading} type="submit">
            {loading ? <LoadingMoon /> : 'Iniciar sesión'}
          </Button>
        </form>
        {/* <Button disabled={loading} hoverEffect={!loading} onClick={handleRefreshToken}>
          test buttom
        </Button> */}
        {/* <Button disabled={loading} hoverEffect={!loading} onClick={handleVerifyToken}>
          verify token
        </Button> */}

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-semibold text-violet-600 hover:text-violet-500">
            Regístrate
          </Link>
        </p>
        <p className="mt-2 text-center text-sm/6 text-gray-500">
          ¿Olvidaste tu contraseña?{' '}
          <Link
            href="/forgot-password-confirm"
            className="font-semibold text-violet-600 hover:text-violet-500"
          >
            Recuperar contraseña
          </Link>
        </p>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
