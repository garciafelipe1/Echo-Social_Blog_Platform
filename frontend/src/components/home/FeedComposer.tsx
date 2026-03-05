import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { mediaUrl } from '@/utils/mediaUrl';
import { ToastError } from '@/components/toast/toast';

export default function FeedComposer() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.auth.profile);

  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const clearImage = useCallback(() => {
    setThumbnail(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);

    try {
      const slug = `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const formData = new FormData();
      formData.append('title', content.trim().slice(0, 80));
      formData.append('description', content.trim());
      formData.append('content', `<p>${content.trim()}</p>`);
      formData.append('status', 'published');
      formData.append('slug', slug);
      formData.append('category', 'social');
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const res = await fetch('/api/blog/post/create', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setContent('');
        clearImage();
        window.location.reload();
      } else {
        const data = await res.json().catch(() => null);
        ToastError(data?.error || 'Error al publicar');
      }
    } catch {
      ToastError('Error de conexion');
    } finally {
      setSubmitting(false);
    }
  }, [content, thumbnail, submitting, clearImage]);

  if (!isAuthenticated) return null;

  return (
    <div className="border-b border-gray-200 px-4 py-3 dark:border-dark-third">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {profile?.profile_picture ? (
            <Image
              src={mediaUrl(profile.profile_picture)}
              width={40}
              height={40}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-gray-600 dark:bg-dark-third dark:text-dark-txt">
              {user?.username?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Que esta pasando?"
            rows={2}
            className="w-full resize-none bg-transparent text-[17px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-dark-txt dark:placeholder:text-dark-txt-secondary"
          />

          {/* Image preview */}
          {preview && (
            <div className="relative mt-2 overflow-hidden rounded-xl">
              <Image
                src={preview}
                alt="Preview"
                width={500}
                height={280}
                className="w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-dark-third">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-full p-2 text-violet-500 transition hover:bg-violet-50 dark:hover:bg-violet-900/20"
              >
                <PhotoIcon className="h-5 w-5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="rounded-full bg-violet-600 px-5 py-1.5 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
