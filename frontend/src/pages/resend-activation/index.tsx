import Button from '@/components/Button';
import EditEmail from '@/components/forms/EditEmail';
import EditPassword from '@/components/forms/EditPassword';
import EditText from '@/components/forms/EditText';
import Layout from '@/hocs/Layout';
import { ReactElement } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { UnknownAction } from 'redux';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import { ToastError } from '@/components/toast/toast';
import { IResendActivationProps } from '@/redux/actions/auth/interfaces';
import { resend_activation } from '@/redux/actions/auth/actions';

export default function Page() {
  const [email, setEmail] = useState<string>('');
  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailRegex.test(email)) {
      ToastError('a valid email is required');
    }

    const resendActivationData: IResendActivationProps = {
      email,
    };
    try {
      setLoading(true);
      await dispatch(resend_activation(resendActivationData));
    } catch (err) {
      // Error handled by Redux action
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-32 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Reenviar el correo de activacion
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleOnSubmit} className="space-y-2">
          <EditEmail
            data={email}
            setData={setEmail}
            title="Email"
            placeholder="YourEmail@gmail.com"
            required
          />

          <Button disabled={loading} hoverEffect={!loading} type="submit">
            {loading ? <LoadingMoon /> : 'Enviar Correo'}
          </Button>
        </form>
        <p className="mt-10 text-center text-sm/6 text-gray-500">
          No tienes cuenta? {''}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Reegistrate
          </Link>
        </p>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
