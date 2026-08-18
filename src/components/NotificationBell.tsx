import { useState } from 'react';
import { Bell, CheckCheck, Trash2, BellRing, CheckCircle2, ClipboardList, Truck, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { classNames } from '@/lib/utils';

function getNotifIcon(title: string) {
  const t = title?.toLowerCase() || '';
  if (t.includes('resolv') || t.includes('complet')) return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
  if (t.includes('assign')) return <ClipboardList className="h-4 w-4 text-blue-600 shrink-0" />;
  if (t.includes('collect') || t.includes('progress')) return <Truck className="h-4 w-4 text-teal-600 shrink-0" />;
  if (t.includes('reject') || t.includes('critical')) return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />;
  return <BellRing className="h-4 w-4 text-amber-500 shrink-0" />;
}

export function NotificationBell({ userId }: { userId: string }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refetch } = useNotifications(userId);
  const [open, setOpen] = useState(false);

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    refetch();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Open notifications panel"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200/80 z-20 animate-fade-in max-h-[520px] flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-800" />
                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-emerald-800 hover:underline font-bold flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="py-14 text-center px-4">
                  <Bell className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No notifications yet. You'll be notified when complaints are assigned, updated, or resolved.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={classNames(
                      'px-4 py-3 border-b border-slate-50 hover:bg-slate-50/80 transition-colors group',
                      !n.read ? 'bg-emerald-50/40 border-l-2 border-l-emerald-500' : ''
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        {getNotifIcon(n.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={classNames('text-xs leading-snug', !n.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700')}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{timeAgo(n.created_at)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-[10px] text-emerald-800 hover:underline font-bold whitespace-nowrap"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete notification"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                <p className="text-[11px] text-slate-400 font-medium text-center">
                  Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
