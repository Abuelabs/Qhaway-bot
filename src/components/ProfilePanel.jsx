import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Moon, Sun, Save, Globe, KeyRound, LogOut, BellRing, Volume2, CalendarClock, Eye, EyeOff, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const defaultNotifications = {
  sos: true,
  dailySummary: true,
  sounds: false,
};

export default function ProfilePanel({ isOpen, onClose, profile, onSave, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(profile.name);
  const [birthdate, setBirthdate] = useState(profile.birthdate);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [notifications, setNotifications] = useState(profile.notifications || defaultNotifications);

  // PIN / security fields (kept local, not persisted to profile)
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [pinStatus, setPinStatus] = useState(null);

  // Sync local form state whenever the panel is (re)opened with the latest profile
  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setBirthdate(profile.birthdate);
      setAvatar(profile.avatar);
      setNotifications(profile.notifications || defaultNotifications);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setPinStatus(null);
    }
  }, [isOpen, profile]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const pinMessages = {
    fillAll: t('profile.pinFillAll'),
    tooShort: t('profile.pinTooShort'),
    mismatch: t('profile.pinMismatch'),
    success: t('profile.pinSuccess'),
  };

  const handleUpdatePin = () => {
    if (!currentPin || !newPin || !confirmPin) {
      setPinStatus('fillAll');
      return;
    }
    if (newPin.length < 4) {
      setPinStatus('tooShort');
      return;
    }
    if (newPin !== confirmPin) {
      setPinStatus('mismatch');
      return;
    }
    setPinStatus('success');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleSave = () => {
    onSave({ name, birthdate, avatar, notifications });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/40 dark:bg-prussian-blue-950/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Side Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-prussian-blue-900 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 dark:border-prussian-blue-700 shrink-0">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t('profile.title')}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-prussian-blue-300 dark:hover:text-white dark:hover:bg-prussian-blue-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-prussian-blue-700 bg-slate-100 dark:bg-prussian-blue-800">
                <img src={avatar} alt={t('profile.title')} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 dark:bg-baltic-blue-500 hover:bg-blue-700 dark:hover:bg-baltic-blue-600 text-white rounded-full flex items-center justify-center shadow-md transition cursor-pointer"
                title={t('profile.changePhoto')}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-prussian-blue-400 font-medium">{t('profile.changePhoto')}</p>
          </div>

          {/* Name field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-prussian-blue-300 uppercase tracking-wider">
              {t('profile.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.namePlaceholder')}
              className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-prussian-blue-50 placeholder-slate-400 dark:placeholder-prussian-blue-500 outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-baltic-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition"
            />
          </div>

          {/* Birthdate field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-prussian-blue-300 uppercase tracking-wider">
              {t('profile.birthdate')}
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-prussian-blue-50 outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-baltic-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition"
            />
          </div>

          {/* Theme toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-prussian-blue-300 uppercase tracking-wider">
              {t('profile.appearance')}
            </label>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-3 transition cursor-pointer hover:border-blue-300 dark:hover:border-baltic-blue-600"
            >
              <span className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-prussian-blue-50">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-baltic-blue-400" />
                ) : (
                  <Sun className="w-4 h-4 text-blue-500" />
                )}
                {theme === 'dark' ? t('profile.darkTheme') : t('profile.lightTheme')}
              </span>

              {/* Switch */}
              <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-baltic-blue-500' : 'bg-slate-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </span>
            </button>
          </div>

          {/* Language selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-prussian-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {t('profile.language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-prussian-blue-50 outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-baltic-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition cursor-pointer"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Notification preferences */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 dark:text-prussian-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5" />
              {t('profile.notifications')}
            </label>

            {[
              { key: 'sos', label: t('profile.sosAlerts'), desc: t('profile.sosAlertsDesc'), icon: BellRing },
              { key: 'dailySummary', label: t('profile.dailySummary'), desc: t('profile.dailySummaryDesc'), icon: CalendarClock },
              { key: 'sounds', label: t('profile.sounds'), desc: t('profile.soundsDesc'), icon: Volume2 },
            ].map(({ key, label, desc, icon: Icon }) => (
              <button
                key={key}
                onClick={() => toggleNotification(key)}
                className="w-full flex items-center justify-between gap-3 bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-3 transition cursor-pointer hover:border-blue-300 dark:hover:border-baltic-blue-600"
              >
                <span className="flex items-center gap-2.5 text-left">
                  <Icon className="w-4 h-4 text-slate-400 dark:text-prussian-blue-400 shrink-0" />
                  <span>
                    <span className="block text-sm font-bold text-slate-700 dark:text-prussian-blue-50">{label}</span>
                    <span className="block text-[11px] text-slate-400 dark:text-prussian-blue-400 mt-0.5">{desc}</span>
                  </span>
                </span>

                <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  notifications[key] ? 'bg-baltic-blue-500' : 'bg-slate-300 dark:bg-prussian-blue-600'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    notifications[key] ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </span>
              </button>
            ))}
          </div>

          {/* Security: PIN change */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-prussian-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              {t('profile.security')}
            </label>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPins ? 'text' : 'password'}
                  inputMode="numeric"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder={t('profile.currentPin')}
                  className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-prussian-blue-50 placeholder-slate-400 dark:placeholder-prussian-blue-500 outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-baltic-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPins((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-prussian-blue-400 dark:hover:text-white transition cursor-pointer"
                  title={showPins ? t('profile.hidePin') : t('profile.showPin')}
                >
                  {showPins ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <input
                type={showPins ? 'text' : 'password'}
                inputMode="numeric"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder={t('profile.newPin')}
                className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-prussian-blue-50 placeholder-slate-400 dark:placeholder-prussian-blue-500 outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-baltic-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition"
              />

              <input
                type={showPins ? 'text' : 'password'}
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder={t('profile.confirmPin')}
                className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-prussian-blue-50 placeholder-slate-400 dark:placeholder-prussian-blue-500 outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-baltic-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition"
              />

              <button
                onClick={handleUpdatePin}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-prussian-blue-700 hover:bg-slate-200 dark:hover:bg-prussian-blue-600 text-slate-700 dark:text-white font-bold py-2.5 rounded-2xl transition active:scale-95 cursor-pointer text-sm"
              >
                <KeyRound className="w-4 h-4" />
                {t('profile.updatePin')}
              </button>

              {pinStatus && (
                <p className={`text-xs font-semibold flex items-center gap-1.5 ${
                  pinStatus === 'success'
                    ? 'text-green-600 dark:text-verdigris-400'
                    : 'text-red-500 dark:text-rose-wine-400'
                }`}>
                  {pinStatus === 'success' && <Check className="w-3.5 h-3.5" />}
                  {pinMessages[pinStatus]}
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 dark:border-prussian-blue-700 shrink-0 space-y-2.5">
          <button
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 dark:bg-baltic-blue-500 hover:bg-blue-700 dark:hover:bg-baltic-blue-600 text-white font-bold py-3 rounded-2xl transition shadow-lg shadow-blue-500/20 dark:shadow-baltic-blue-500/20 active:scale-95 cursor-pointer text-sm"
          >
            <Save className="w-4 h-4" />
            {t('profile.save')}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full inline-flex items-center justify-center gap-2 bg-transparent border border-slate-200 dark:border-prussian-blue-700 hover:bg-red-50 dark:hover:bg-rose-wine-950 text-red-600 dark:text-rose-wine-400 font-bold py-3 rounded-2xl transition active:scale-95 cursor-pointer text-sm"
            >
              <LogOut className="w-4 h-4" />
              {t('profile.logout')}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
