import HoverClass from '@/utils/api/HoverClass';
import Link from 'next/link';

interface ComponentProps {
  children: React.ReactNode;
  href?: string;
  useHover?: boolean;
}

export default function NavbarLink({ children, href = '/', useHover = true }: ComponentProps) {
  return (
    <Link href={href} className="inline-flex items-center">
      <div className={`${useHover ? HoverClass : ''}`}>{children}</div>
    </Link>
  );
}

NavbarLink.defaultProps = {
  href: '/',
  useHover: true,
};
