import NotificationItem from './NotificationItem';
import type { INotification } from '@/hooks/useNotifications';

interface Props {
  notifications: INotification[];
  loading: boolean;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  loading,
  onMarkAllRead,
  onClose,
}: Props) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div className="fixed inset-x-0 top-0 z-50 h-full overflow-hidden bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:h-auto sm:w-96 sm:rounded-xl sm:border sm:border-gray-200 dark:bg-dark-main sm:dark:border-dark-third">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-dark-third">
          <h3 className="text-sm font-bold text-gray-900 dark:text-dark-txt">
            Notificaciones
          </h3>
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            Marcar todas como leidas
          </button>
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">Cargando...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              No tienes notificaciones.
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-dark-third">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onClose={onClose} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
