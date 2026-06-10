import React from 'react';
import { History, Info, CheckCircle2, AlertTriangle, Siren } from 'lucide-react';
import { mockActivityLogs } from '../data/mockData';
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

export default function ActivityLogView() {
  const { t } = useLanguage();
  return (
    <div className="w-full space-y-6">

      {/* View Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <History className="w-6 h-6 text-blue-600 dark:text-baltic-blue-400" />
            {t('activity.title')}
          </h2>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400 mt-0.5">
            {t('activity.subtitle')}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-5">
        <div className="space-y-1">
          {mockActivityLogs.map((log, index) => {
            const style = typeStyles[log.type] || typeStyles.info;
            const Icon = style.icon;
            const isLast = index === mockActivityLogs.length - 1;
            return (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.badge}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-slate-100 dark:bg-prussian-blue-800 my-1" />}
                </div>
                <div className={`flex-1 ${isLast ? '' : 'pb-5'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{log.message}</p>
                    <span className="text-xs text-slate-400 dark:text-prussian-blue-400 font-semibold whitespace-nowrap">{log.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
