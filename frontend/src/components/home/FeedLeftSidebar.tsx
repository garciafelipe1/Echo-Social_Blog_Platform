import Link from 'next/link';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  UserIcon,
  BookmarkIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid';
import { mediaUrl } from '@/utils/mediaUrl';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  activeIcon?: React.ElementType;
  authRequired?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', href: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
  { label: 'Explorar', href: '/blog', icon: MagnifyingGlassIcon },
  { label: 'Contacto', href: '/contact', icon: EnvelopeIcon },
  { label: 'Guardados', href: '/bookmarks', icon: BookmarkIcon, authRequired: true },
  { label: 'Perfil', href: '', icon: UserIcon, authRequired: true },
];

export default function FeedLeftSidebar() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.auth.profile);
  const filteredItems = NAV_ITEMS.filter((item) => !item.authRequired || isAuthenticated).map(
    (item) =>
      item.label === 'Perfil' && user?.username ? { ...item, href: `/@/${user.username}` } : item,
  );

  return (
    <nav className="sticky top-4 flex flex-col items-end pr-4 xl:items-start xl:pr-8">
      {/* Nav links */}
      <ul className="space-y-1">
        {filteredItems.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="dark:text-dark-txt dark:hover:bg-dark-second flex items-center gap-4 rounded-full px-4 py-3 text-[19px] text-gray-900 transition-colors hover:bg-gray-100"
            >
              <item.icon className="h-[26px] w-[26px]" />
              <span className="hidden xl:inline">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Publish button */}
      {isAuthenticated && (
        <Link
          href={user?.username ? `/@/${user.username}` : '/login'}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-violet-700"
        >
          <PencilSquareIcon className="h-5 w-5 xl:hidden" />
          <span className="hidden xl:inline">Publicar</span>
        </Link>
      )}

      {/* User badge (bottom) */}
      {isAuthenticated && user && (
        <Link
          href={`/@/${user.username}`}
          className="dark:hover:bg-dark-second mt-auto flex items-center gap-3 rounded-full p-3 transition-colors hover:bg-gray-100 xl:mt-8"
        >
          <div className="shrink-0 overflow-hidden rounded-full">
            {profile?.profile_picture ? (
              <Image
                src={mediaUrl(profile.profile_picture)}
                width={40}
                height={40}
                alt="Avatar del usuario"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="dark:bg-dark-third dark:text-dark-txt flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-gray-600">
                {user.username?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="hidden min-w-0 xl:block">
            <p className="dark:text-dark-txt truncate text-sm font-semibold text-gray-900">
              {user.username}
            </p>
            <p className="dark:text-dark-txt-secondary truncate text-xs text-gray-500">
              @{user.username}
            </p>
          </div>
        </Link>
      )}
    </nav>
  );
}
