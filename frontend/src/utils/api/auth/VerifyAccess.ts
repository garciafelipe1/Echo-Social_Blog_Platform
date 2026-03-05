import { ToastError } from '@/components/toast/toast';
import parseCookies from '@/utils/cookies/parseCookies';
import { Verified } from 'lucide-react';
import { GetServerSidePropsContext } from 'next';

export default async function verifyAccess(context: GetServerSidePropsContext) {
  const cookies = parseCookies(context.req.headers.cookie || '');
  const accessToken = cookies['access'];

  if (accessToken === '') {
    return {
      Verified: false,
    };
  }

  try {
    const apiRes = await fetch(`${process.env.API_URL}/auth/jwt/verify/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: accessToken,
      }),
    });

    if (apiRes.status === 200) {
      return {
        Verified: true,
        accessToken,
      };
    } else {
      return {
        Verified: false,
      };
    }
  } catch (err) {
    return {
      Verified: false,
    };
  }
}
