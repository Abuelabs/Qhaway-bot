import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ContactsView from './ContactsView';
import RoutinesView from './RoutinesView';
import Mensajeria from './Mensajeria';
import ProfilePanel from './ProfilePanel';
import RobotStatusView from './RobotStatusView';
import HealthView from './HealthView';
import ActivityLogView from './ActivityLogView';
import { CalendarRange, Users, MessageSquare, BookOpen, ArrowLeft, Bot, Stethoscope, History, ChevronDown } from 'lucide-react';
import { mockElderProfiles, mockRoutinesByElder } from '../data/mockData';
import RoutinesProgressBar from './ui/RoutinesProgressBar';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard({ adminName = "ADMIN", onLogout }) {
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedElderId, setSelectedElderId] = useState(mockElderProfiles[0].id);
  const [profile, setProfile] = useState({
    name: adminName,
    birthdate: '',
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    notifications: { sos: true, dailySummary: true, sounds: false }
  });

  const [routinesByElder, setRoutinesByElder] = useState(() => {
    // Normalize mockRoutinesByElder so that they have 'name' and 'description' properties and full recurrence support
    const normalized = {};
    Object.entries(mockRoutinesByElder).forEach(([elderId, list]) => {
      normalized[elderId] = list.map(r => {
        const hasSlashDate = r.days && r.days.includes('/');
        const defaultDateDDMMYY = hasSlashDate ? r.days : (r.id % 2 === 0 ? "11/06/26" : "10/06/26");
        
        // Parse DD/MM/YY back to YYYY-MM-DD
        const parts = defaultDateDDMMYY.split('/');
        const startDateRaw = parts.length === 3 ? `20${parts[2]}-${parts[1]}-${parts[0]}` : new Date().toISOString().split('T')[0];
        
        // Map legacy repeat/boolean to recurrenceRule object
        let recRule = {
          frequency: 'daily',
          interval: 1,
          end: { type: 'never' }
        };
        
        if (r.repeat === false || r.repeat === 'nunca') {
          recRule = {
            frequency: 'daily',
            interval: 1,
            end: { type: 'occurrences', value: 1 }
          };
        } else if (r.repeat === 'diariamente') {
          recRule = {
            frequency: 'daily',
            interval: 1,
            end: { type: 'never' }
          };
        } else if (r.repeat === 'semanalmente') {
          const dateObj = new Date(startDateRaw + 'T00:00:00');
          const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
          const weekday = weekdays[dateObj.getDay()];
          recRule = {
            frequency: 'weekly',
            interval: 1,
            byDays: [weekday],
            end: { type: 'never' }
          };
        } else if (r.repeat === 'mensualmente') {
          const dateObj = new Date(startDateRaw + 'T00:00:00');
          recRule = {
            frequency: 'monthly',
            interval: 1,
            byMonthDays: [dateObj.getDate()],
            end: { type: 'never' }
          };
        }
        
        return {
          id: r.id,
          name: r.name || r.title || "",
          repeat: r.repeat !== undefined ? r.repeat : true,
          recurrenceRule: r.recurrenceRule || recRule,
          startDate: r.startDate || startDateRaw,
          endDate: r.endDate || null,
          days: defaultDateDDMMYY,
          time: r.time,
          description: r.description || r.desc || "",
          status: r.status || "pending",
          urgency: r.urgency || "medium",
          category: r.category || "general",
          completedAt: r.completedAt || null
        };
      });
    });
    return normalized;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const selectedElder = mockElderProfiles.find(e => e.id === selectedElderId) || mockElderProfiles[0];
  const elderRoutines = routinesByElder[selectedElderId] || [];
  const completedRoutines = elderRoutines.filter(r => r.status === 'completed').length;
  const totalRoutines = elderRoutines.length;
  const completionPercent = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;

  return (
    <div className="bg-slate-950 w-full min-h-screen overflow-hidden">
      <div
        style={{
          clipPath: revealed ? 'circle(150% at 50vw 50vh)' : 'circle(0% at 50vw 50vh)',
          transition: 'clip-path 4.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="min-h-screen bg-slate-50 dark:bg-prussian-blue-950 text-slate-800 dark:text-prussian-blue-100 font-sans flex flex-col antialiased transition-colors duration-300"
      >
        {/* Universal Top Bar */}
        <Navbar adminName={profile.name} avatar={profile.avatar} onProfileClick={() => setIsProfileOpen(true)} />

        {/* Profile Management Panel */}
        <ProfilePanel
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={profile}
          onSave={setProfile}
          onLogout={onLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">

          {currentView === 'home' ? (
            <div className="space-y-8 animate-fade-in flex-1 flex flex-col justify-center py-12">
              <div className="text-center max-w-3xl mx-auto mb-8 -mt-2.5 flex flex-col items-center">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard.caringFor')} {selectedElder.name}</h2>
                <p className="text-slate-500 dark:text-prussian-blue-300 text-sm sm:text-base mt-3">{t('dashboard.subtitle')}</p>

                {/* Elder profile switcher */}
                {mockElderProfiles.length > 1 && (
                  <div className="relative mt-4">
                    <select
                      value={selectedElderId}
                      onChange={(e) => setSelectedElderId(Number(e.target.value))}
                      className="appearance-none bg-white dark:bg-prussian-blue-900 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl pl-4 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-prussian-blue-50 outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-baltic-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition cursor-pointer"
                    >
                      {mockElderProfiles.map((elder) => (
                        <option key={elder.id} value={elder.id}>
                          {elder.name} · {elder.room}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-prussian-blue-400 pointer-events-none" />
                  </div>
                )}

                {/* Reusable UI Progress Bar */}
                <RoutinesProgressBar completed={completedRoutines} total={totalRoutines} />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">

                {/* CARD 1: Rutinas */}
                <div
                  onClick={() => setCurrentView('rutinas')}
                  className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-baltic-blue-950 text-blue-600 dark:text-baltic-blue-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <CalendarRange className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{t('dashboard.cards.rutinas.title')}</h3>
                    <p className="text-xs text-slate-400 dark:text-prussian-blue-400 leading-relaxed">{t('dashboard.cards.rutinas.desc')}</p>
                  </div>
                </div>

                {/* CARD 2: Contactos */}
                <div
                  onClick={() => setCurrentView('contactos')}
                  className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-green-50 dark:bg-verdigris-950 text-green-600 dark:text-verdigris-400 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{t('dashboard.cards.contactos.title')}</h3>
                    <p className="text-xs text-slate-400 dark:text-prussian-blue-400 leading-relaxed">{t('dashboard.cards.contactos.desc')}</p>
                  </div>
                </div>

                {/* CARD 3: Mensajes */}
                <div
                  onClick={() => setCurrentView('mensajes')}
                  className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-purple-50 dark:bg-rose-wine-950 text-purple-600 dark:text-rose-wine-400 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{t('dashboard.cards.mensajes.title')}</h3>
                    <p className="text-xs text-slate-400 dark:text-prussian-blue-400 leading-relaxed">{t('dashboard.cards.mensajes.desc')}</p>
                  </div>
                </div>

                {/* CARD 4: Biblioteca */}
                <div
                  onClick={() => setCurrentView('biblioteca')}
                  className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-orange-50 dark:bg-chocolate-950 text-orange-600 dark:text-chocolate-400 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{t('dashboard.cards.biblioteca.title')}</h3>
                    <p className="text-xs text-slate-400 dark:text-prussian-blue-400 leading-relaxed">{t('dashboard.cards.biblioteca.desc')}</p>
                  </div>
                </div>

                {/* CARD 5: Estado del Robot */}
                <div
                  onClick={() => setCurrentView('robot')}
                  className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-baltic-blue-950 text-blue-600 dark:text-baltic-blue-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{t('dashboard.cards.robot.title')}</h3>
                    <p className="text-xs text-slate-400 dark:text-prussian-blue-400 leading-relaxed">{t('dashboard.cards.robot.desc')}</p>
                  </div>
                </div>

                {/* CARD 6: Salud */}
                <div
                  onClick={() => setCurrentView('salud')}
                  className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-green-50 dark:bg-verdigris-950 text-green-600 dark:text-verdigris-400 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{t('dashboard.cards.salud.title')}</h3>
                    <p className="text-xs text-slate-400 dark:text-prussian-blue-400 leading-relaxed">{t('dashboard.cards.salud.desc')}</p>
                  </div>
                </div>

                {/* CARD 7: Actividad */}
                <div
                  onClick={() => setCurrentView('actividad')}
                  className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-orange-50 dark:bg-chocolate-950 text-orange-600 dark:text-chocolate-400 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{t('dashboard.cards.actividad.title')}</h3>
                    <p className="text-xs text-slate-400 dark:text-prussian-blue-400 leading-relaxed">{t('dashboard.cards.actividad.desc')}</p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in flex-1">

              {/* Back Button Panel */}
              <div>
                <button
                  onClick={() => setCurrentView('home')}
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-prussian-blue-300 dark:hover:text-white text-sm font-bold transition hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('dashboard.back')}
                </button>
              </div>

              {/* Conditional Views content */}
              {currentView === 'rutinas' && (
                <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs">
                  <RoutinesView 
                    routines={elderRoutines} 
                    setRoutines={(updatedRoutines) => {
                      setRoutinesByElder(prev => {
                        const next = typeof updatedRoutines === 'function' ? updatedRoutines(prev[selectedElderId] || []) : updatedRoutines;
                        return {
                          ...prev,
                          [selectedElderId]: next
                        };
                      });
                    }} 
                  />
                </div>
              )}

              {currentView === 'contactos' && (
                <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs">
                  <ContactsView />
                </div>
              )}

              {currentView === 'mensajes' && (
                <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl overflow-hidden shadow-xs" style={{ minHeight: '600px' }}>
                  <Mensajeria />
                </div>
              )}

              {currentView === 'biblioteca' && (
                <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-12 text-center min-h-[350px] flex flex-col items-center justify-center">
                  <BookOpen className="w-12 h-12 text-orange-500 mb-3 animate-pulse" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('dashboard.placeholders.biblioteca.title')}</h3>
                  <p className="text-xs text-slate-400 dark:text-prussian-blue-400 max-w-xs leading-relaxed">{t('dashboard.placeholders.biblioteca.desc')}</p>
                </div>
              )}

              {currentView === 'robot' && (
                <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs">
                  <RobotStatusView />
                </div>
              )}

              {currentView === 'salud' && (
                <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs">
                  <HealthView elderId={selectedElderId} elderName={selectedElder.name} />
                </div>
              )}

              {currentView === 'actividad' && (
                <div className="bg-white dark:bg-prussian-blue-900 border border-slate-100 dark:border-prussian-blue-800 rounded-3xl p-6 shadow-xs">
                  <ActivityLogView />
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
