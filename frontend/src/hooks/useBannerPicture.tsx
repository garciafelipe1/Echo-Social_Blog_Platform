import fetchMybannerPicture from '@/utils/api/profile/GetMyBannerPicture';
import { useCallback, useEffect, useState } from 'react';

export default function useBannerPicture() {
  const [bannerPicture, setBannerPicture] = useState<any>(null);
  const [percentage, setPercentage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const getBannerPicture = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchMybannerPicture();
      if (res.status === 200) {
        setBannerPicture(res.results.banner_picture_url);
      }
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getBannerPicture();
  }, [getBannerPicture]);

  return {
    bannerPicture,
    setBannerPicture,
    percentage,
    setPercentage,
    loading,
  };
}
