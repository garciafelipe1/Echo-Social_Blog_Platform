import Button from '@/components/Button';
import Link from 'next/link';
import EditPassword from '@/components/forms/EditPassword';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import { ToastError } from '@/components/toast/toast';
import Layout from '@/hocs/Layout';
import usePasswordValidation from '@/hooks/usePasswordValidation';
import { forgot_password_confirm } from '@/redux/actions/auth/actions';
import { IForgotPasswordConfirmProps } from '@/redux/actions/auth/interfaces';
import { useSearchParams } from 'next/navigation';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  const [password, setPassword] = useState<string>('');
  const [rePassword, setRePassword] = useState<string>('');

  const { canSubmit, PasswordValidationText } = usePasswordValidation({
    password,
    rePassword,
  });

  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) {
      ToastError('Completa todos los campos y cumple los requisitos de la contraseña.');
      return;
    }

    const forgotPasswordConfirmData: IForgotPasswordConfirmProps = {
      new_password: password,
      re_new_password: rePassword,
      uid,
      token,
    };

    try {
      setLoading(true);
      const success = await dispatch(forgot_password_confirm(forgotPasswordConfirmData));
      if (success) router.push('/login');
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
          Nueva contraseña
        </h2>
        <p className="dark:text-dark-txt-secondary mt-2 text-center text-sm text-gray-500">
          Introduce tu nueva contraseña. Usa el enlace que te enviamos por correo.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleOnSubmit} className="space-y-2">
          <EditPassword data={password} setData={setPassword} title="Nueva contraseña" required />
          <EditPassword
            data={rePassword}
            setData={setRePassword}
            title="Repetir nueva contraseña"
            required
          />
          {PasswordValidationText()}
          <Button disabled={loading} hoverEffect={!loading} type="submit">
            {loading ? <LoadingMoon /> : 'Cambiar contraseña'}
          </Button>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-500">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
