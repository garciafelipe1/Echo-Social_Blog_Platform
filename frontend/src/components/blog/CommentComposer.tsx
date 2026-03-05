import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import Image from 'next/image';
import { mediaUrl } from '@/utils/mediaUrl';

interface Props {
  onSubmit: (content: string) => Promise<void>;
  submitting: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentComposer({
  onSubmit,
  submitting,
  placeholder = 'Escribe un comentario...',
  autoFocus = false,
}: Props) {
  const [content, setContent] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    await onSubmit(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="shrink-0">
        {user?.profile_picture ? (
          <Image
            width={32}
            height={32}
            alt=""
            src={mediaUrl(user.profile_picture)}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600 dark:bg-violet-900 dark:text-violet-300">
            {user?.username?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </div>
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={2}
          className="dark:border-dark-third dark:bg-dark-second dark:text-dark-txt dark:placeholder-dark-txt-secondary dark:focus:bg-dark-main w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-violet-400 focus:bg-white dark:focus:border-violet-500"
        />
        <div className="mt-1.5 flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
      </div>
    </form>
  );
}
