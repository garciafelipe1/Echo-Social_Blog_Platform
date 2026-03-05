import DesktopNavbar from './desktop';
import MobileNavbar from './mobile';

interface Props {
  onSearchClick?: () => void;
}

export default function Navbar({ onSearchClick }: Props) {
  return (
    <div className="z-10 w-full lg:overflow-y-visible">
      <DesktopNavbar onSearchClick={onSearchClick} />
      <MobileNavbar onSearchClick={onSearchClick} />
    </div>
  );
}
