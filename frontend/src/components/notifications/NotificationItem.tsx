import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import { mediaUrl } from '@/utils/mediaUrl';
import { HeartIcon, ChatBubbleOvalLeftIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import type { INotification } from '@/hooks/useNotifications';

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; getText: (n: INotification) => string }
> = {
  like: {
    icon: <HeartIcon className="h-4 w-4" />,
    color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    getText: (n) => `le dio me gusta a "${n.post_title}"`,
  },
  comment: {
    icon: <ChatBubbleOvalLeftIcon className="h-4 w-4" />,
    color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20',
    getText: (n) => `comento en "${n.post_title}"`,
  },
  reply: {
    icon: <ChatBubbleOvalLeftIcon className="h-4 w-4" />,
    color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20',
    getText: (n) => `respondio a tu comentario en "${n.post_title}"`,
  },
  follow: {
    icon: <UserPlusIcon className="h-4 w-4" />,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    getText: () => 'te empezo a seguir',
  },
};

interface Props {
  notification: INotification;
  onClose: () => void;
}

export default function NotificationItem({ notification, onClose }: Props) {
  const config = TYPE_CONFIG[notification.notification_type] || TYPE_CONFIG.like;
  const href =
    notification.notification_type === 'follow'
      ? `/@/${notification.sender.username}/`
      : notification.post_slug
        ? `/blog/post/${notification.post_slug}`
        : '#';

  return (
    <Link
      href={href}
      onClick={onClose}
      className={`dark:hover:bg-dark-second flex items-start gap-3 px-4 py-3 transition hover:bg-gray-50 ${
        !notification.is_read ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {notification.sender.profile_picture ? (
          <Image
            width={32}
            height={32}
            alt=""
            src={mediaUrl(notification.sender.profile_picture)}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="dark:bg-dark-third dark:text-dark-txt-secondary flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
            {notification.sender.username?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="dark:text-dark-txt text-sm text-gray-800">
          <span className="font-semibold">{notification.sender.username}</span>{' '}
          {config.getText(notification)}
        </p>
        <p className="dark:text-dark-txt-secondary mt-0.5 text-xs text-gray-400">
          {moment(notification.created_at).fromNow()}
        </p>
      </div>

      {/* Type icon */}
      <div className={`shrink-0 rounded-full p-1.5 ${config.color}`}>{config.icon}</div>
    </Link>
  );
}
