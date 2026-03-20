import Button from '@/components/Button';
import Layout from '@/hocs/Layout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { UnknownAction } from 'redux';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import { ToastError } from '@/components/toast/toast';
import { activate } from '@/redux/actions/auth/actions';

function getParamsFromUrl(): { uid: string; token: string } {
  if (typeof window === 'undefined') return { uid: '', token: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    uid: params.get('uid') ?? '',
    token: params.get('token') ?? '',
  };
}

export default function Page() {
  const [params, setParams] = useState({ uid: '', token: '' });
  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const autoTriggered = useRef(false);

  // Leer uid y token de la URL en el cliente
  useEffect(() => {
    setParams(getParamsFromUrl());
  }, []);

  const doActivate = useCallback(
    async (uid: string, token: string) => {
      if (!token?.trim() || !uid?.trim()) {
        ToastError('Faltan el token o el UID. Usa el enlace del correo.');
        return;
      }
      try {
        setLoading(true);
        const success = await dispatch(activate({ uid: uid.trim(), token: token.trim() }));
        if (success) router.push('/login');
      } catch (err) {
        ToastError(`${err}`);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, router],
  );

  // Auto-activar al cargar cuando la URL ya tiene uid y token (enlace del correo)
  useEffect(() => {
    const { uid, token } = params;
    if (!uid || !token || autoTriggered.current) return;
    autoTriggered.current = true;
    doActivate(uid, token);
  }, [params, doActivate]);

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { uid, token } = getParamsFromUrl();
    await doActivate(uid, token);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 pt-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="dark:text-dark-txt mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Activa tu cuenta
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleOnSubmit} className="space-y-2">
          <Button disabled={loading} hoverEffect={!loading} type="submit">
            {loading ? <LoadingMoon /> : 'Activar cuenta'}
          </Button>
        </form>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
