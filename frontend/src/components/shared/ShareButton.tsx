import { useCallback, useState } from 'react';
import { PaperAirplaneIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Props {
  title: string;
  url: string;
  slug?: string;
  className?: string;
}

async function registerShare(slug: string, platform: string): Promise<void> {
  const res = await fetch('/api/blog/post/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, plataform: platform }),
    credentials: 'include',
  });
  if (!res.ok) {
    // silent - share already succeeded from user perspective
  }
}

export default function ShareButton({ title, url, slug, className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const fullUrl = `${window.location.origin}${url}`;
    let platform = 'other';

    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        if (slug) {
          await registerShare(slug, platform);
        }
        return;
      } catch {
        // user cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (slug) {
        await registerShare(slug, 'other');
      }
    } catch {
      // silent
    }
  }, [title, url, slug]);

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
