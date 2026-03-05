import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { mediaUrl } from '@/utils/mediaUrl';
import useSearch from '@/hooks/useSearch';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, results, loading, search, clear } = useSearch();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      clear();
    }
  }, [open, clear]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!open) {
          // parent handles opening
        } else {
          onClose();
        }
      }
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const hasResults =
    results.posts.length > 0 || results.users.length > 0 || results.categories.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:pt-[15vh]">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div className="dark:bg-dark-main sm:dark:border-dark-third relative z-10 flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-w-lg sm:rounded-xl sm:border sm:border-gray-200">
        {/* Search input */}
        <div className="dark:border-dark-third flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Buscar posts, usuarios, categorias..."
            className="dark:text-dark-txt flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto sm:max-h-[50vh]">
          {loading && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">Buscando...</div>
          )}

          {!loading && query && !hasResults && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No se encontraron resultados.
            </div>
          )}

          {!loading && hasResults && (
            <div className="dark:divide-dark-third divide-y divide-gray-100">
              {/* Users */}
              {results.users.length > 0 && (
                <div className="px-4 py-3">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Usuarios
                  </h3>
                  <div className="space-y-2">
                    {results.users.map((u) => (
                      <Link
                        key={u.username}
                        href={`/@/${u.username}/`}
                        onClick={onClose}
                        className="dark:hover:bg-dark-second flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-gray-50"
                      >
                        {u.profile_picture ? (
                          <Image
                            width={28}
                            height={28}
                            alt=""
                            src={mediaUrl(u.profile_picture)}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">
                            {u.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div>
                          <p className="dark:text-dark-txt text-sm font-medium text-gray-900">
                            {u.first_name} {u.last_name}
                          </p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {results.posts.length > 0 && (
                <div className="px-4 py-3">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Posts
                  </h3>
                  <div className="space-y-1">
                    {results.posts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/blog/post/${p.slug}`}
                        onClick={onClose}
                        className="dark:hover:bg-dark-second flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-gray-50"
                      >
                        {p.thumbnail && (
                          <Image
                            width={40}
                            height={40}
                            alt=""
                            src={mediaUrl(p.thumbnail)}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="dark:text-dark-txt truncate text-sm font-medium text-gray-900">
                            {p.title}
                          </p>
                          <p className="truncate text-xs text-gray-400">@{p.user?.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {results.categories.length > 0 && (
                <div className="px-4 py-3">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Categorias
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/blog?category=${c.slug}`}
                        onClick={onClose}
                        className="dark:bg-dark-second dark:text-dark-txt dark:hover:bg-dark-third rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!query && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              <kbd className="dark:bg-dark-second rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium">
                Ctrl+K
              </kbd>{' '}
              para buscar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
