import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const useIsDarkMode = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isDarkMode, setisDarkMode] = useState<boolean>(false);
  const { theme } = useTheme();

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (mounted) {
      queueMicrotask(() => setisDarkMode(theme === 'dark'));
    }
  }, [theme, mounted]);

  return isDarkMode;
};

export default useIsDarkMode;
