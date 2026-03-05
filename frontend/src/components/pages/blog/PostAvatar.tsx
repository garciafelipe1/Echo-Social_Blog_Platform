import Image from 'next/image';
import { mediaUrl } from '@/utils/mediaUrl';

interface Props {
  profilePicture?: string | null;
  username?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { container: 'h-6 w-6', text: 'text-[10px]' },
  md: { container: 'h-8 w-8', text: 'text-xs' },
  lg: { container: 'h-10 w-10', text: 'text-sm' },
} as const;

export default function PostAvatar({
  profilePicture,
  username = '?',
  size = 'md',
  className = '',
}: Props) {
  const s = SIZES[size];
  const initial = username?.charAt(0)?.toUpperCase() || '?';

  if (profilePicture) {
    return (
      <Image
        width={64}
        height={64}
        alt={username}
        src={mediaUrl(profilePicture)}
        className={`${s.container} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex ${s.container} items-center justify-center rounded-full bg-violet-100 ${s.text} font-semibold text-violet-600 dark:bg-violet-900 dark:text-violet-300 ${className}`}
    >
      {initial}
    </span>
  );
}
