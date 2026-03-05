import { useCallback, useState } from 'react';
import { PaperAirplaneIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Props {
  title: string;
  url: string;
  className?: string;
}

export default function ShareButton({ title, url, className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const fullUrl = `${window.location.origin}${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        return;
      } catch {
        // user cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  }, [title, url]);

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${className}`}
      aria-label="Compartir"
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-emerald-500">Copiado</span>
        </>
      ) : (
        <PaperAirplaneIcon className="h-4 w-4" />
      )}
    </button>
  );
}
