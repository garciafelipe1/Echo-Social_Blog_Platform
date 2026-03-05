import Layout from '@/hocs/Layout';
import { ReactElement, useEffect, useState } from 'react';
import Container from '@/components/pages/profile/Container';
import Button from '@/components/Button';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import EditPassword from '@/components/forms/EditPassword';
import usePasswordValidation from '@/hooks/usePasswordValidation';
import { ToastError, ToastSuccess } from '@/components/toast/toast';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import verifyAccess from '@/utils/api/auth/VerifyAccess';

export const getServerSideProps:GetServerSideProps = async (context:GetServerSidePropsContext) => {
  const {Verified} = await verifyAccess(context);

  if (!Verified) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: { 
       },
  };
}
export default function Page() {
  const[loading, setLoading] = useState<boolean>(false)
  const[currentPassword, setCurrentPassword] = useState<string>('')
  const[newPassword, setNewPassword] = useState<string>('')
  const[repeatNewPassword, setRepeatNewPassword] = useState<string>('')

  const { canSubmit, PasswordValidationText } = usePasswordValidation({
    password: newPassword,
    rePassword: repeatNewPassword,
  });
  const handleChangePassword = async () => {
    if (!canSubmit) {
      ToastError('must fill all requierements passwords');
      return null;
    }
    
    try {
        setLoading(true)
        const res = await fetch('/api/auth/change_password', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_password: newPassword,
            re_new_password: repeatNewPassword,
            current_password: currentPassword,
          }),
        });

        if (res.status === 204) {
          ToastSuccess('your password has been updated');
        }
        
    } catch (error) {
        ToastError('error changing password');
    }
    finally{
        setLoading(false)
    }
  }
    
  return (
    <Container>
      <div>
        <div className=" ">
          <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="ml-4 mt-4">
              <h3 className="text-base font-semibold text-gray-900">User Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                This information will be in this profile and will be visible to the public.
              </p>
            </div>

            <div className="ml-4 mt-4 shrink-0">
              <Button
                style={{
                  width: '150px',
                }}
                disabled={loading}
                onClick={handleChangePassword}
                hoverEffect
              >
                {loading ? <LoadingMoon /> : 'save paswords'}
              </Button>
            </div>
          </div>
        </div>

        <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Current Password
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditPassword data={currentPassword} setData={setCurrentPassword} />
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">New Password</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditPassword data={newPassword} setData={setNewPassword} />
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Repeat new Password
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditPassword data={repeatNewPassword} setData={setRepeatNewPassword} />
            </dd>
          </div>
          {PasswordValidationText()}
        </dl>
      </div>
    </Container>
  );
}
Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
