import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function DarkModeButton() {
  const { systemTheme, theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const renderThemeChanger = () => {
    if (!mounted) return null;

    const currentTheme = theme === 'system' ? systemTheme : theme;

    if (currentTheme === 'dark') {
      return (
        <button type="button" onClick={() => setTheme('light')} aria-label="Cambiar a modo claro">
          <SunIcon
            className="h-6 w-auto text-yellow-600 hover:text-yellow-700"
            aria-hidden="true"
          />
        </button>
      );
    }

    return (
      <button type="button" onClick={() => setTheme('dark')} aria-label="Cambiar a modo oscuro">
        <MoonIcon className="h-6 w-auto text-blue-800 hover:text-blue-900" aria-hidden="true" />
      </button>
    );
  };

  return renderThemeChanger();
}
