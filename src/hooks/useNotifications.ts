import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    user_id: 'demo_citizen_id',
    title: 'Complaint In Progress',
    message: 'Collector Rajesh Kumar has been assigned to your complaint WST-2026-002.',
    type: 'assignment',
    related_complaint_id: 'c-102',
    read: false,
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 'n-2',
    user_id: 'demo_citizen_id',
    title: 'Complaint Resolved',
    message: 'Medical waste complaint WST-2026-004 has been completed.',
    type: 'completion',
    related_complaint_id: 'c-104',
    read: true,
    created_at: new Date(Date.now() - 10000 * 1000).toISOString(),
  },
];

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const queryPromise = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      const timeoutPromise = new Promise<{ data: any }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 500)
      );

      const { data } = await Promise.race([queryPromise, timeoutPromise]);
      const list = (data as Notification[]) || MOCK_NOTIFICATIONS;
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
      setUnreadCount(MOCK_NOTIFICATIONS.filter((n) => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const insertNotification = useCallback(
    async (params: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
      const newNotif: Notification = {
        id: 'n_' + Math.random().toString(36).substring(2, 9),
        read: false,
        created_at: new Date().toISOString(),
        ...params,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    []
  );

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, insertNotification, refetch: fetchNotifications };
}

