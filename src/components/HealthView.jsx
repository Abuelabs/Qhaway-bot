import React from 'react';
import { HeartPulse, Activity, Droplet, Thermometer, Moon, Footprints, Stethoscope } from 'lucide-react';
import { mockVitalsByElder } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function HealthView({ elderId = 1, elderName = '' }) {
  const { t } = useLanguage();
  const vitals = mockVitalsByElder[elderId] || mockVitalsByElder[1];

  const stats = [
    { key: 'heartRate', label: t('health.heartRate'), value: `${vitals.heartRate} bpm`, icon: HeartPulse, color: 'rose-wine' },
    { key: 'bloodPressure', label: t('health.bloodPressure'), value: vitals.bloodPressure, icon: Activity, color: 'baltic-blue' },
    { key: 'spo2', label: t('health.spo2'), value: `${vitals.spo2}%`, icon: Droplet, color: 'verdigris' },
    { key: 'temperature', label: t('health.temperature'), value: `${vitals.temperature}°C`, icon: Thermometer, color: 'chocolate' },
    { key: 'sleepHours', label: t('health.sleep'), value: `${vitals.sleepHours} h`, icon: Moon, color: 'baltic-blue' },
    { key: 'steps', label: t('health.steps'), value: vitals.steps.toLocaleString('es-PE'), icon: Footprints, color: 'verdigris' },
  ];

  const colorClasses = {
    'rose-wine': 'bg-purple-50 dark:bg-rose-wine-950 text-purple-600 dark:text-rose-wine-400',
    'baltic-blue': 'bg-blue-50 dark:bg-baltic-blue-950 text-blue-600 dark:text-baltic-blue-400',
    'verdigris': 'bg-green-50 dark:bg-verdigris-950 text-green-600 dark:text-verdigris-400',
    'chocolate': 'bg-orange-50 dark:bg-chocolate-950 text-orange-600 dark:text-chocolate-400',
  };

  return (
    <div className="w-full space-y-6">

      {/* View Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Stethoscope className="w-6 h-6 text-blue-600 dark:text-baltic-blue-400" />
            {t('health.title')}
          </h2>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400 mt-0.5">
            {t('health.subtitle', { name: elderName || t('health.defaultName'), time: vitals.lastUpdated })}
          </p>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ key, label, value, icon: Icon, color }) => (
          <div key={key} className="bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-prussian-blue-400 font-semibold">{label}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-prussian-blue-500 leading-relaxed">
        {t('health.disclaimer')}
      </p>

    </div>
  );
}
