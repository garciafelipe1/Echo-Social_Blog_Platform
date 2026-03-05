import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import { mediaUrl } from '@/utils/mediaUrl';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  BookmarkIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid';
import Container from './Container';

interface Props {
  onSearchClick?: () => void;
}

export default function MobileNavbar({ onSearchClick }: Props) {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.auth.profile);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => router.pathname === path;

  return (
    <Container>
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-dark-third">
        <Link href="/">
          <Image
            src="/assets/img/logos/F.png"
            width={32}
            height={32}
            alt="Home"
            className="h-8 w-8"
          />
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSearchClick}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-dark-txt dark:hover:bg-dark-third"
            aria-label="Buscar"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-dark-txt dark:hover:bg-dark-third"
            aria-label="Menu"
          >
            {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Slide-down menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <nav className="fixed inset-x-0 top-0 z-50 max-h-[85vh] overflow-y-auto rounded-b-2xl bg-white shadow-xl dark:bg-dark-main">
            {/* Menu header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-dark-third">
              <span className="text-sm font-bold text-gray-900 dark:text-dark-txt">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-third"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* User info */}
            {isAuthenticated && user && (
              <Link
                href={`/@/${user.username}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 dark:border-dark-third"
              >
                {profile?.profile_picture ? (
                  <Image
                    src={mediaUrl(profile.profile_picture)}
                    width={40}
                    height={40}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                    {user.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-txt">
                    {user.first_name || user.username}
                  </p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
              </Link>
            )}

            {/* Links */}
            <div className="py-2">
              {[
                { label: 'Inicio', href: '/', icon: HomeIcon },
                { label: 'Blog', href: '/blog', icon: PencilSquareIcon },
                { label: 'Contacto', href: '/contact', icon: EnvelopeIcon },
                ...(isAuthenticated
                  ? [
                      { label: 'Guardados', href: '/bookmarks', icon: BookmarkIcon },
                      {
                        label: 'Mi perfil',
                        href: `/@/${user?.username || ''}`,
                        icon: UserIcon,
                      },
                    ]
                  : [
                      { label: 'Iniciar sesion', href: '/login', icon: ArrowRightOnRectangleIcon },
                      { label: 'Registrarse', href: '/register', icon: UserIcon },
                    ]),
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[15px] text-gray-700 transition hover:bg-gray-50 dark:text-dark-txt dark:hover:bg-dark-second"
                >
                  <item.icon className="h-5 w-5 text-gray-400 dark:text-dark-txt-secondary" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-md dark:border-dark-third dark:bg-dark-main/95">
        <div className="mx-auto flex max-w-lg items-center justify-around py-1.5">
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive('/') ? 'text-violet-600' : 'text-gray-500 dark:text-dark-txt-secondary'}`}
          >
            {isActive('/') ? (
              <HomeIconSolid className="h-6 w-6" />
            ) : (
              <HomeIcon className="h-6 w-6" />
            )}
            <span className="text-[10px] font-medium">Inicio</span>
          </Link>

          <button
            type="button"
            onClick={onSearchClick}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 dark:text-dark-txt-secondary"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
            <span className="text-[10px] font-medium">Buscar</span>
          </button>

          {isAuthenticated ? (
            <>
              <Link
                href="/bookmarks"
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isActive('/bookmarks') ? 'text-violet-600' : 'text-gray-500 dark:text-dark-txt-secondary'}`}
              >
                <BookmarkIcon className="h-6 w-6" />
                <span className="text-[10px] font-medium">Guardados</span>
              </Link>

              <Link
                href={`/@/${user?.username || ''}`}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 dark:text-dark-txt-secondary"
              >
                {profile?.profile_picture ? (
                  <Image
                    src={mediaUrl(profile.profile_picture)}
                    width={24}
                    height={24}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-6 w-6" />
                )}
                <span className="text-[10px] font-medium">Perfil</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 dark:text-dark-txt-secondary"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                <span className="text-[10px] font-medium">Login</span>
              </Link>
              <Link
                href="/register"
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 dark:text-dark-txt-secondary"
              >
                <UserIcon className="h-6 w-6" />
                <span className="text-[10px] font-medium">Registro</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </Container>
  );
}
