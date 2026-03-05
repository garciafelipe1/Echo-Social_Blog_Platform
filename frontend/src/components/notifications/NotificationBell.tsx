import { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import useNotifications from '@/hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="dark:text-dark-txt dark:hover:bg-dark-third relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
        aria-label="Notificaciones"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onMarkAllRead={markAllAsRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
