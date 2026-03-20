import Button from '@/components/Button';
import EditEmail from '@/components/forms/EditEmail';
import EditPassword from '@/components/forms/EditPassword';
import EditText from '@/components/forms/EditText';
import Layout from '@/hocs/Layout';
import { ReactElement } from 'react';
import { useState } from 'react';
import usePasswordValidation from '@/hooks/usePasswordValidation';
import { UnknownAction } from 'redux';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ToastError } from '@/components/toast/toast';
import { IRegisterProps } from '../../redux/actions/auth/interfaces';
import { register } from '../../redux/actions/auth/actions';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Page() {
  const [email, setEmail] = useState<string>('');

  const [firstname, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  const [username, setUsername] = useState<string>('');

  const [password, setPassword] = useState<string>('');
  const [rePassword, setRePassword] = useState<string>('');

  const { canSubmit, PasswordValidationText } = usePasswordValidation({
    password,
    rePassword,
    username,
  });

  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) {
      ToastError(
        'Completa todos los campos y asegúrate de cumplir los requisitos de la contraseña.',
      );
      return;
    }

    const registerData: IRegisterProps = {
      email,
      username,
      first_name: firstname,
      last_name: lastName,
      password,
      re_password: rePassword,
    };

    try {
      setLoading(true);
      const success = await dispatch(register(registerData));
      if (success) router.push('/login');
    } catch (err) {
      // Error handled by Redux action
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-32 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="dark:text-dark-txt mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Registrate y empieza ahora!
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleOnSubmit} className="space-y-2">
          <EditText
            showmMaxTextLength
            data={firstname}
            setData={setFirstName}
            title="Nombre"
            required
          />
          <EditText data={lastName} setData={setLastName} title="Apellido" required />
          <EditText data={username} setData={setUsername} title="Nombre de usuario" required />
          <EditEmail
            data={email}
            setData={setEmail}
            title="Email"
            placeholder="tu@email.com"
            required
          />
          <EditPassword
            data={password}
            setData={setPassword}
            title="Contraseña"
            required
            autoComplete="new-password"
          />
          <EditPassword
            data={rePassword}
            setData={setRePassword}
            title="Repetir contraseña"
            required
            autoComplete="new-password"
          />
          {PasswordValidationText()}
          <Button disabled={loading} hoverEffect={!loading} type="submit">
            {loading ? <LoadingMoon /> : 'Registrarse'}
          </Button>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          ¿No te llegó el correo de activación?{' '}
          <Link
            href="/resend-activation"
            className="font-semibold text-violet-600 hover:text-violet-500"
          >
            Reenviar correo
          </Link>
        </p>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
