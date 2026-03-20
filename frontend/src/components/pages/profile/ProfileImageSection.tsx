import EditImage, { ImageData } from '@/components/forms/EditImage';

interface Props {
  profilePicture: ImageData | string | null;
  onLoadProfilePicture: (data: ImageData) => void;
  setProfilePicture: (data: ImageData) => void;
  profilePicturePercentage: number;
  bannerPicture: ImageData | string | null;
  onLoadBannerPicture: (data: ImageData) => void;
  setBannerPicture: (data: ImageData) => void;
  bannerPicturePercentage: number;
}

export default function ProfileImageSection({
  profilePicture,
  onLoadProfilePicture,
  setProfilePicture,
  profilePicturePercentage,
  bannerPicture,
  onLoadBannerPicture,
  setBannerPicture,
  bannerPicturePercentage,
}: Props) {
  return (
    <>
      <li className="py-6">
        <EditImage
          onLoad={onLoadProfilePicture}
          data={profilePicture}
          setData={setProfilePicture}
          percentage={profilePicturePercentage}
          title="Foto de perfil"
        />
      </li>
      <li className="py-6">
        <EditImage
          onLoad={onLoadBannerPicture}
          data={bannerPicture}
          setData={setBannerPicture}
          percentage={bannerPicturePercentage}
          variant="banner"
          title="Imagen de portada"
        />
      </li>
    </>
  );
}
