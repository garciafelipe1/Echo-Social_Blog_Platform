import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import validator from 'validator';

import { RootState } from '@/redux/reducers';
import { loadProfile, loadUser } from '@/redux/actions/auth/actions';
import { ToastError, ToastSuccess, ToastWarning } from '@/components/toast/toast';
import useProfilePicture from '@/hooks/useProfilePicture';
import useBannerPicture from '@/hooks/useBannerPicture';
import { ImageData } from '@/components/forms/EditImage';

const isValidDate = (data: string) => !Number.isNaN(new Date(data).getTime());
const isValidUrl = (url: string) => validator.isURL(url, { require_protocol: false });
const isRichTextEmpty = (str: string) => str.replace(/<[^>]+>/g, '').trim() === '';

export default function useProfileForm() {
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.auth.profile);
  const dispatch: ThunkDispatch<RootState, unknown, UnknownAction> = useDispatch();

  const [loading, setLoading] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);
  const [hasChangesProfile, setHasChangesProfile] = useState(false);
  const [hasChangesProfilePicture, setHasChangesProfilePicture] = useState(false);
  const [hasChangesBannerPicture, setHasChangesBannerPicture] = useState(false);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [biography, setBiography] = useState('');

  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [uploadingBannerPicture, setUploadingBannerPicture] = useState(false);

  const [birthday, setBirthday] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [snapchat, setSnapchat] = useState('');
  const [facebook, setFacebook] = useState('');

  const {
    profilePicture,
    setProfilePicture,
    percentage: profilePicturePercentage,
    setPercentage: setProfilePicturePercentage,
    loading: loadingProfilePicture,
  } = useProfilePicture();

  const {
    bannerPicture,
    setBannerPicture,
    percentage: bannerPicturePercentage,
    setPercentage: setBannerPicturePercentage,
    loading: loadingBannerPicture,
  } = useBannerPicture();

  const onLoadProfilePicture = (newImage: ImageData) => {
    if (newImage?.file !== profilePicture?.file) {
      setProfilePicture(newImage);
      setHasChangesProfilePicture(true);
    }
  };

  const onLoadBannerPicture = (newImage: ImageData) => {
    if (newImage?.file !== bannerPicture?.file) {
      setBannerPicture(newImage);
      setHasChangesBannerPicture(true);
    }
  };

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setFirstName(user.first_name);
      setLastName(user.last_name);
    }
    if (profile) {
      setBirthday(profile.birthday);
      setWebsite(profile.website);
      setTwitter(profile.twitter);
      setInstagram(profile.instagram);
      setGithub(profile.github);
      setLinkedin(profile.linkedin);
      setYoutube(profile.youtube);
      setTiktok(profile.tiktok);
      setFacebook(profile.facebook);
      setSnapchat(profile.snapchat);
    }
  }, [user, profile]);

  useEffect(() => {
    setHasChanges(
      username !== user?.username ||
      firstName !== user?.first_name ||
      lastName !== user?.last_name,
    );

    setHasChangesProfile(
      (biography !== profile?.biography && !isRichTextEmpty(biography)) ||
      (birthday !== profile?.birthday && isValidDate(birthday)) ||
      (website !== profile?.website && isValidUrl(website)) ||
      (twitter !== profile?.twitter && isValidUrl(twitter)) ||
      (instagram !== profile?.instagram && isValidUrl(instagram)) ||
      (github !== profile?.github && isValidUrl(github)) ||
      (linkedin !== profile?.linkedin && isValidUrl(linkedin)) ||
      (youtube !== profile?.youtube && isValidUrl(youtube)) ||
      (tiktok !== profile?.tiktok && isValidUrl(tiktok)) ||
      (facebook !== profile?.facebook && isValidUrl(facebook)) ||
      (snapchat !== profile?.snapchat && isValidUrl(snapchat)),
    );
  }, [
    user, username, biography, firstName, lastName,
    birthday, website, twitter, instagram, github,
    linkedin, youtube, tiktok, snapchat, facebook, profile,
  ]);

  const handleSaveUserData = async () => {
    const updatedData: Record<string, string> = {};
    if (username !== user?.username) updatedData.username = username;
    if (firstName !== user?.first_name) updatedData.first_name = firstName;
    if (lastName !== user?.last_name) updatedData.last_name = lastName;

    if (Object.keys(updatedData).length === 0) {
      ToastWarning('No changes made to user data.');
      return;
    }

    const response = await fetch('/user/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      ToastSuccess('User data updated successfully.');
      await dispatch(loadUser());
    } else {
      ToastError('Failed to update user data.');
    }
  };

  const handleSaveProfileData = async () => {
    const fields: Array<[string, string, string | undefined]> = [
      ['biography', biography, profile?.biography],
      ['birthday', birthday, profile?.birthday],
      ['website', website, profile?.website],
      ['twitter', twitter, profile?.twitter],
      ['instagram', instagram, profile?.instagram],
      ['github', github, profile?.github],
      ['linkedin', linkedin, profile?.linkedin],
      ['youtube', youtube, profile?.youtube],
      ['tiktok', tiktok, profile?.tiktok],
      ['snapchat', snapchat, profile?.snapchat],
      ['facebook', facebook, profile?.facebook],
    ];

    const updatedData: Record<string, string> = {};
    for (const [key, value, original] of fields) {
      if (value !== original) updatedData[key] = value;
    }

    if (Object.keys(updatedData).length === 0) {
      ToastWarning('No changes made to profile data.');
      return;
    }

    const response = await fetch('api/profile/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      ToastSuccess('Profile data updated successfully.');
      await dispatch(loadProfile());
    } else {
      ToastError('Failed to update Profile data.');
    }
  };

  const uploadImage = async (file: File, endpoint: string): Promise<boolean> => {
    const formData = new FormData();
    formData.append('file', file, `profile_${Date.now()}_${file.name.replace(/\s/g, '_')}`);

    const response = await fetch(endpoint, { method: 'POST', body: formData });

    if (response.ok) {
      await dispatch(loadProfile());
      return true;
    }
    const errorData = await response.json();
    ToastError(`Upload failed: ${errorData.message || response.statusText}`);
    return false;
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePicture?.file) {
      ToastError('No profile picture selected.');
      return;
    }
    setUploadingProfilePicture(true);
    setProfilePicturePercentage(30);
    try {
      const ok = await uploadImage(profilePicture.file as File, '/api/profile/upload_profile_picture/');
      if (ok) {
        ToastSuccess('Profile picture updated successfully!');
        setHasChangesProfilePicture(false);
      }
    } catch {
      ToastError('An unexpected error occurred while uploading.');
    } finally {
      setUploadingProfilePicture(false);
      setTimeout(() => setProfilePicturePercentage(0), 1000);
    }
  };

  const handleSaveBannerPicture = async () => {
    if (!bannerPicture?.file) {
      ToastError('No banner picture selected.');
      return;
    }
    setUploadingBannerPicture(true);
    setBannerPicturePercentage(30);
    try {
      const ok = await uploadImage(bannerPicture.file as File, '/api/profile/upload_banner_picture/');
      if (ok) {
        ToastSuccess('Banner updated successfully!');
        setHasChangesBannerPicture(false);
      }
    } catch {
      ToastError('An unexpected error occurred while uploading.');
    } finally {
      setUploadingBannerPicture(false);
      setTimeout(() => setBannerPicturePercentage(0), 1000);
    }
  };

  const handleSaveAll = async () => {
    if (!hasChanges && !hasChangesProfile && !hasChangesProfilePicture && !hasChangesBannerPicture) {
      ToastWarning('No changes made.');
      return;
    }
    try {
      setLoading(true);
      if (hasChanges) await handleSaveUserData();
      if (hasChangesProfile) await handleSaveProfileData();
      if (hasChangesProfilePicture) await handleSaveProfilePicture();
      if (hasChangesBannerPicture) await handleSaveBannerPicture();
      ToastSuccess('Changes saved successfully.');
    } catch {
      ToastError('An error occurred while saving data.');
    } finally {
      setLoading(false);
    }
  };

  const hasAnyChanges = hasChanges || hasChangesProfile || hasChangesProfilePicture || hasChangesBannerPicture;

  return {
    loading,
    hasAnyChanges,
    user: { username, setUsername, firstName, setFirstName, lastName, setLastName },
    profileFields: {
      biography, setBiography,
      birthday, setBirthday,
      website, setWebsite,
      twitter, setTwitter,
      instagram, setInstagram,
      github, setGithub,
      linkedin, setLinkedin,
      youtube, setYoutube,
      tiktok, setTiktok,
      snapchat, setSnapchat,
      facebook, setFacebook,
    },
    images: {
      profilePicture, onLoadProfilePicture, setProfilePicture, profilePicturePercentage,
      bannerPicture, onLoadBannerPicture, setBannerPicture, bannerPicturePercentage,
    },
    handleSaveAll,
  };
}
