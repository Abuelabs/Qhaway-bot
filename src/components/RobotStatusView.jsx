import React from 'react';
import { Bot, Battery, BatteryFull, Wifi, Radar, Camera, RadioTower, Cpu, CheckCircle2, ScanEye } from 'lucide-react';
import { mockRobotStatus } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function RobotStatusView() {
  const { t } = useLanguage();
  const robot = mockRobotStatus;

  const batteryColor = robot.battery > 60
    ? 'text-green-600 dark:text-verdigris-400'
    : robot.battery > 25
      ? 'text-yellow-600 dark:text-chocolate-400'
      : 'text-red-600 dark:text-rose-wine-400';

  const sensorEntries = [
    { key: 'lidar', label: t('robot.sensors.lidar'), icon: Radar },
    { key: 'sonar', label: t('robot.sensors.sonar'), icon: RadioTower },
    { key: 'cameras', label: t('robot.sensors.cameras'), icon: Camera },
    { key: 'fallDetection', label: t('robot.sensors.fallDetection'), icon: ScanEye },
  ];

  return (
    <div className="w-full space-y-6">

      {/* View Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Bot className="w-6 h-6 text-blue-600 dark:text-baltic-blue-400" />
            {t('robot.title')}
          </h2>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400 mt-0.5">
            {robot.name} · Serie {robot.serialNumber}
          </p>
        </div>

        <div className={`hidden sm:flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-xl border ${
          robot.online
            ? 'text-green-600 dark:text-verdigris-400 bg-green-50 dark:bg-verdigris-950 border-green-100/50 dark:border-verdigris-800'
            : 'text-red-600 dark:text-rose-wine-400 bg-red-50 dark:bg-rose-wine-950 border-red-100/50 dark:border-rose-wine-800'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{robot.online ? t('robot.online') : t('robot.offline')}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl p-4 flex flex-col gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-prussian-blue-800 ${batteryColor}`}>
            {robot.battery > 25 ? <BatteryFull className="w-5 h-5" /> : <Battery className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-prussian-blue-400 font-semibold">{t('robot.battery')}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{robot.battery}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl p-4 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-baltic-blue-950 text-blue-600 dark:text-baltic-blue-400">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-prussian-blue-400 font-semibold">{t('robot.wifi')}</p>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{robot.wifi}</p>
            <p className="text-[11px] text-slate-400 dark:text-prussian-blue-400 mt-0.5">{robot.connectionSpeed}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl p-4 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-rose-wine-950 text-purple-600 dark:text-rose-wine-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-prussian-blue-400 font-semibold">{t('robot.mode')}</p>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{robot.mode}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 rounded-2xl p-4 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 dark:bg-chocolate-950 text-orange-600 dark:text-chocolate-400">
            <RadioTower className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-prussian-blue-400 font-semibold">{t('robot.lastSync')}</p>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{robot.lastSync}</p>
            <p className="text-[11px] text-slate-400 dark:text-prussian-blue-400 mt-0.5">{t('robot.firmware')} {robot.firmware}</p>
          </div>
        </div>
      </div>

      {/* Sensors Panel */}
      <div className="bg-white dark:bg-prussian-blue-800/40 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-5">
        <h3 className="text-xs font-bold text-slate-500 dark:text-prussian-blue-300 uppercase tracking-wider mb-4">{t('robot.sensorsTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sensorEntries.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3 bg-slate-50 dark:bg-prussian-blue-800 rounded-2xl px-4 py-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-prussian-blue-900 text-blue-600 dark:text-baltic-blue-400 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{label}</p>
                <p className="text-[11px] text-slate-400 dark:text-prussian-blue-400 truncate">{robot.sensors[key]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
