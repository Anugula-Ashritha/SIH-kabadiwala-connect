import React from 'react';
import { X, Bell, CheckCircle2, Clock, IndianRupee, TrendingUp, PackageCheck } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'payment':
        return <IndianRupee className="w-4 h-4 text-emerald-600" />;
      case 'price':
        return <TrendingUp className="w-4 h-4 text-sky-600" />;
      case 'lot':
      default:
        return <PackageCheck className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center">
              <Bell className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Notifications / सूचनाएं
              </h2>
              <span className="text-[11px] text-emerald-200">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-emerald-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs shrink-0">
            <span className="text-emerald-900 font-medium">Recent Activity</span>
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5 divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotification?.(notif)}
              className={`pt-2.5 first:pt-0 flex items-start gap-3 rounded-xl p-2 transition-colors cursor-pointer ${
                notif.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/50 hover:bg-emerald-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.read ? 'bg-slate-100' : 'bg-white border border-emerald-200 shadow-2xs'
                }`}
              >
                {renderIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3
                    className={`text-xs font-bold truncate ${
                      notif.read ? 'text-slate-800' : 'text-slate-900 font-extrabold'
                    }`}
                  >
                    {notif.title}
                  </h3>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{notif.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
