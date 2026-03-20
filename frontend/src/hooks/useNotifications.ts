import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/reducers';

export interface INotification {
  id: string;
  sender: {
    username: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
  };
  notification_type: 'like' | 'comment' | 'reply' | 'follow';
  post_title: string | null;
  post_slug: string | null;
  is_read: boolean;
  created_at: string;
}

export default function useNotifications() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/list');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.results ?? data ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/notifications/unread_count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.results?.unread_count ?? data.unread_count ?? 0);
      }
    } catch {
      // silent
    }
  }, [isAuthenticated]);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/mark_read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return;

    try {
      const ws = new WebSocket(`${wsUrl}/ws/notifications/`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setUnreadCount((prev) => prev + 1);
          setNotifications((prev) => [
            {
              id: data.id,
              sender: {
                username: data.sender_username,
                first_name: data.sender_name?.split(' ')[0] || '',
                last_name: data.sender_name?.split(' ').slice(1).join(' ') || '',
                profile_picture: null,
              },
              notification_type: data.notification_type,
              post_title: data.post_title,
              post_slug: data.post_slug,
              is_read: false,
              created_at: data.created_at,
            },
            ...prev,
          ]);
        } catch {
          // malformed message
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
      };

      return () => {
        ws.close();
      };
    } catch {
      // WebSocket not available
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAllAsRead,
  };
}
