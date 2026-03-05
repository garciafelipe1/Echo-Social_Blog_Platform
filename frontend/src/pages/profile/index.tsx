import Layout from '@/hocs/Layout';
import { ReactElement } from 'react';

import Container from '@/components/pages/profile/Container';
import Button from '@/components/Button';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import EditDate from '@/components/forms/EditDate';
import EditRichText from '@/components/forms/EditRichText';
import ProfileUserForm from '@/components/pages/profile/ProfileUserForm';
import ProfileImageSection from '@/components/pages/profile/ProfileImageSection';
import ProfileSocialLinks from '@/components/pages/profile/ProfileSocialLinks';
import useProfileForm from '@/hooks/useProfileForm';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import verifyAccess from '@/utils/api/auth/VerifyAccess';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { Verified } = await verifyAccess(context);

  if (!Verified) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return { props: {} };
};

export default function Page() {
  const { loading, hasAnyChanges, user, profileFields, images, handleSaveAll } = useProfileForm();

  const socialLinks = [
    { label: 'Website', value: profileFields.website, setter: profileFields.setWebsite },
    { label: 'Instagram', value: profileFields.instagram, setter: profileFields.setInstagram },
    { label: 'Facebook', value: profileFields.facebook, setter: profileFields.setFacebook },
    { label: 'LinkedIn', value: profileFields.linkedin, setter: profileFields.setLinkedin },
    { label: 'YouTube', value: profileFields.youtube, setter: profileFields.setYoutube },
    { label: 'TikTok', value: profileFields.tiktok, setter: profileFields.setTiktok },
    { label: 'Github', value: profileFields.github, setter: profileFields.setGithub },
    { label: 'Snapchat', value: profileFields.snapchat, setter: profileFields.setSnapchat },
    { label: 'Twitter', value: profileFields.twitter, setter: profileFields.setTwitter },
  ];

  return (
    <Container>
      <div>
        <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
          <div className="ml-4 mt-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-dark-txt">
              Información del usuario
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-txt-secondary">
              Esta información será visible en tu perfil público.
            </p>
          </div>
          <div className="ml-4 mt-4 shrink-0">
            <Button onClick={handleSaveAll} disabled={loading || !hasAnyChanges} hoverEffect>
              {loading ? <LoadingMoon /> : 'save changes'}
            </Button>
          </div>
        </div>

        <ProfileUserForm
          username={user.username}
          setUsername={user.setUsername}
          firstName={user.firstName}
          setFirstName={user.setFirstName}
          lastName={user.lastName}
          setLastName={user.setLastName}
        />
      </div>

      <div>
        <h2 className="text-base/7 font-semibold text-gray-900 dark:text-dark-txt">Perfil</h2>
        <p className="mt-1 text-sm/6 text-gray-500 dark:text-dark-txt-secondary">
          Tu información pública de perfil.
        </p>

        <ul className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-dark-third dark:border-dark-third">
          <ProfileImageSection
            profilePicture={images.profilePicture}
            onLoadProfilePicture={images.onLoadProfilePicture}
            setProfilePicture={images.setProfilePicture}
            profilePicturePercentage={images.profilePicturePercentage}
            bannerPicture={images.bannerPicture}
            onLoadBannerPicture={images.onLoadBannerPicture}
            setBannerPicture={images.setBannerPicture}
            bannerPicturePercentage={images.bannerPicturePercentage}
          />
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-dark-txt">
              Biography
            </h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditRichText data={profileFields.biography} setData={profileFields.setBiography} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-dark-txt">
              Birthday
            </h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditDate
                useTime={false}
                data={profileFields.birthday}
                setData={profileFields.setBirthday}
              />
            </div>
          </li>
          <ProfileSocialLinks fields={socialLinks} />
        </ul>
      </div>
    </Container>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
