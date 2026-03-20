import AuthLinks from '../auth/AuthLinks';
import Image from 'next/image';
import GuestLinks from '../guest/GuestLinks';
import Container from './Container';
import Header from './Header';
import NavbarLink from './NavbarLink';
import RightMenuContainer from './RightMenuContainer';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Props {
  onSearchClick?: () => void;
}

export default function DesktopNavbar({ onSearchClick }: Props) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Container>
      <Header>
        {/* left side */}
        <div className="flex items-center space-x-4">
          <NavbarLink useHover={false}>
            <Image
              className="h-12 w-auto"
              src="/assets/img/logos/F.png"
              width={512}
              height={512}
              priority
              alt="home"
            />
          </NavbarLink>
          <NavbarLink href="/contact">Contact</NavbarLink>
          <NavbarLink href="/blog">Blog</NavbarLink>
        </div>
        {/* middle side */}
        <button
          type="button"
          onClick={onSearchClick}
          className="dark:bg-dark-second dark:text-dark-txt-secondary dark:hover:bg-dark-third flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-400 transition hover:bg-gray-200"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="dark:bg-dark-third dark:text-dark-txt-secondary ml-2 hidden rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 sm:inline">
            Ctrl+K
          </kbd>
        </button>

        {/* right side */}
        <RightMenuContainer>{isAuthenticated ? <AuthLinks /> : <GuestLinks />}</RightMenuContainer>
      </Header>
    </Container>
  );
}
