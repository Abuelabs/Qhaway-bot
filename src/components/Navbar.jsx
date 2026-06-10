import React from 'react';
import { Heart } from 'lucide-react';
<<<<<<< HEAD

export default function Navbar({ adminName = "Usuario" }) {
  return (
    <header className="w-full bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand/Logo Area */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Qhaway<span className="text-blue-600">bot</span>
            </span>
            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold tracking-widest bg-blue-50 text-blue-700 rounded-md uppercase">
              Admin
=======
import NotificationsBell from './NotificationsBell';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ adminName = "Usuario", avatar, onProfileClick }) {
  const { t } = useLanguage();
  return (
    <header className="w-full bg-white dark:bg-prussian-blue-900 border-b border-slate-100 dark:border-prussian-blue-800 shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand/Logo Area */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 dark:bg-baltic-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 dark:shadow-baltic-blue-500/20">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              Qhaway<span className="text-blue-600 dark:text-baltic-blue-400">bot</span>
            </span>
            <span className="ml-2 px-2 py-0.5 text-[10px] font-bold tracking-widest bg-blue-50 dark:bg-baltic-blue-950 text-blue-700 dark:text-baltic-blue-300 rounded-md uppercase">
              {t('nav.admin')}
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
            </span>
          </div>
        </div>

<<<<<<< HEAD
        {/* Logged User display */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 leading-none">{adminName}</h4>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Administrador</span>
          </div>
=======
        {/* Right side: notifications + Logged User display */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationsBell />

          <button
            onClick={onProfileClick}
            className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-prussian-blue-800 cursor-pointer group"
            title={t('nav.openProfile')}
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-blue-500/30 dark:group-hover:ring-baltic-blue-500/30 transition">
              <img
                src={avatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-none">{adminName}</h4>
              <span className="text-[9px] text-slate-400 dark:text-prussian-blue-400 font-semibold block mt-0.5">{t('nav.role')}</span>
            </div>
          </button>
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
        </div>

      </div>
    </header>
  );
}
