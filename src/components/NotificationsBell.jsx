import React, { useEffect, useRef, useState } from 'react';
import { Bell, Info, CheckCircle2, AlertTriangle, Siren } from 'lucide-react';
import { mockNotifications } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

const typeStyles = {
  info: {
    icon: Info,
    badge: 'bg-blue-50 dark:bg-baltic-blue-950 text-blue-600 dark:text-baltic-blue-400',
  },
  success: {
    icon: CheckCircle2,
    badge: 'bg-green-50 dark:bg-verdigris-950 text-green-600 dark:text-verdigris-400',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'bg-yellow-50 dark:bg-chocolate-950 text-yellow-600 dark:text-chocolate-400',
  },
  alert: {
    icon: Siren,
    badge: 'bg-red-50 dark:bg-rose-wine-950 text-red-600 dark:text-rose-wine-400',
  },
};

export default function NotificationsBell() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const containerRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-prussian-blue-300 dark:hover:text-white dark:hover:bg-prussian-blue-800 transition cursor-pointer"
        title={t('nav.notifications')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-red-500 dark:bg-rose-wine-500 text-white text-[9px] font-bold rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-prussian-blue-800">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">{t('notificationsPanel.title')}</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-blue-600 dark:text-baltic-blue-400 hover:underline cursor-pointer"
              >
                {t('notificationsPanel.markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-prussian-blue-800">
            {notifications.map((notification) => {
              const style = typeStyles[notification.type] || typeStyles.info;
              const Icon = style.icon;
              return (
                <div
                  key={notification.id}
                  className={`flex gap-3 px-4 py-3 ${notification.read ? '' : 'bg-blue-50/40 dark:bg-baltic-blue-950/30'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.badge}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{notification.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-prussian-blue-300 leading-relaxed mt-0.5">{notification.message}</p>
                    <p className="text-[10px] text-slate-400 dark:text-prussian-blue-500 font-semibold mt-1">{notification.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
