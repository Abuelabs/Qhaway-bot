import React, { useState, useEffect } from 'react';
import NotificationsBell from './NotificationsBell';
import ContactsView from './ContactsView';
import RoutinesView from './RoutinesView';
import Mensajeria, { MOCK_INITIAL_MESSAGES } from './Mensajeria';
import ProfilePanel from './ProfilePanel';
import RobotStatusView from './RobotStatusView';
import HealthView from './HealthView';
import ActivityLogView from './ActivityLogView';
import RadialSidebar from './RadialSidebar';
import { CalendarRange, Users, MessageSquare, BookOpen, ArrowLeft, Bot, Stethoscope, History, ChevronDown, Wifi, WifiOff, Battery, AlertTriangle, Clock, Power } from 'lucide-react';
import { mockElderProfiles, mockRoutinesByElder } from '../data/mockData';
import RoutinesProgressBar from './ui/RoutinesProgressBar';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard({ adminName = "ADMIN", onLogout }) {
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [isOpen, setIsOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [selectedElderId, setSelectedElderId] = useState(mockElderProfiles[0].id);
  const [isBotOnline, setIsBotOnline] = useState(true);
  const [isBotOn, setIsBotOn] = useState(false);
  const [isTracking, setIsTracking] = useState(true);
  const [messages, setMessages] = useState(MOCK_INITIAL_MESSAGES);
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

  // State to manage profile panel visibility (renamed to avoid collisions)
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Calculate next pending routine
  const getNextRoutine = () => {
    const pendingRoutines = elderRoutines.filter(r => r.status === 'pending');
    if (pendingRoutines.length === 0) return null;

    const timeToMin = (t) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const sorted = [...pendingRoutines].sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const next = sorted.find(r => timeToMin(r.time) >= currentMinutes);
    return next || sorted[0];
  };
  const nextRoutine = getNextRoutine();

  return (
    <div className="bg-slate-950 w-full min-h-screen overflow-hidden">
      <div
        style={{
          clipPath: revealed ? 'circle(150% at 50vw 50vh)' : 'circle(0% at 50vw 50vh)',
          transition: 'clip-path 4.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="relative min-h-screen bg-slate-50 dark:bg-prussian-blue-950 text-slate-800 dark:text-prussian-blue-100 font-sans flex flex-col antialiased transition-colors duration-300"
      >
        {/* Floating Universal User and Notification Area */}
        <div className="absolute top-4 right-4 sm:right-6 lg:right-8 z-40 flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-prussian-blue-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-200/50 dark:border-prussian-blue-800/50 shadow-xs">
          <NotificationsBell />

          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200/60 dark:border-prussian-blue-800/60 cursor-pointer group"
            title={t('nav.openProfile')}
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-blue-500/30 dark:group-hover:ring-baltic-blue-500/30 transition">
              <img
                src={profile.avatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden xs:block">
              <h4 className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">{profile.name}</h4>
              <span className="text-[9px] text-slate-400 dark:text-prussian-blue-400 font-semibold block mt-0.5">{t('nav.role')}</span>
            </div>
          </button>
        </div>

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
            <div className="space-y-8 animate-fade-in flex-1 flex flex-col justify-start pt-4 pb-12">
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

              {/* Qhawaybot Connection Status Panel */}
              <div className="bg-white dark:bg-prussian-blue-900 border border-slate-200/60 dark:border-prussian-blue-800/80 rounded-3xl p-6 max-w-2xl w-full mx-auto shadow-xs mt-6 transition-all duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-prussian-blue-800">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600 dark:text-baltic-blue-400" />
                    <span className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight">Qhawaybot V1</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Interactive Connection Status Badge */}
                    <button 
                      onClick={() => setIsBotOnline(!isBotOnline)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                        isBotOnline 
                          ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50' 
                          : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50'
                      }`}
                      title="Haz clic para alternar el estado de conexión del robot"
                    >
                      <span className={`w-2 h-2 rounded-full ${isBotOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      {isBotOnline ? 'En línea' : 'Sin conexión'}
                    </button>

                    {/* Interactive Tracking Status Badge */}
                    {isBotOnline && isBotOn && (
                      <button
                        onClick={() => setIsTracking(!isTracking)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                          isTracking
                            ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50'
                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100/55 dark:border-amber-900/50'
                        }`}
                        title="Haz clic para alternar el modo de seguimiento"
                      >
                        <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'}`} />
                        {isTracking ? 'Seguimiento' : 'Modo Espera'}
                      </button>
                    )}

                    {/* Minimized red power-off button */}
                    {isBotOnline && isBotOn && (
                      <button
                        onClick={() => setIsBotOn(false)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-650 hover:text-white text-red-500 rounded-xl border border-red-500/25 transition-all duration-300 cursor-pointer flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0"
                        title="Apagar Robot"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {!isBotOnline ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mb-3">
                      <WifiOff className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Bot Sin Conexión</h3>
                    <p className="text-xs text-slate-400 dark:text-prussian-blue-400 max-w-sm mt-1 leading-relaxed">
                      Qhawaybot no responde. Comprueba que el robot esté encendido, tenga batería y esté conectado a la misma red Wi-Fi.
                    </p>
                  </div>
                ) : !isBotOn ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in gap-3">
                    <button
                      onClick={() => setIsBotOn(true)}
                      className="w-20 h-20 bg-green-600 hover:bg-green-500 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg shadow-green-600/25 hover:shadow-green-500/40"
                      title="Iniciar Robot"
                    >
                      <Power className="w-9 h-9" />
                    </button>
                    <span className="font-bold text-slate-800 dark:text-prussian-blue-250 text-sm tracking-wide">
                      Iniciar Robot
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-100 dark:divide-prussian-blue-800 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-4 md:divide-x divide-slate-100 dark:divide-prussian-blue-800">
                      {/* Battery Status */}
                      <div className="flex flex-col justify-center pb-4 md:pb-0 md:pr-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider">Nivel de Batería</span>
                          <span className="text-sm font-black text-slate-800 dark:text-white">85%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Battery className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-prussian-blue-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-prussian-blue-400 mt-2 font-medium">Estado: Excelente · {isTracking ? 'Seguimiento activo' : 'En modo espera'}</span>
                      </div>

                      {/* Next Reminder */}
                      <div className="pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                        <span className="text-xs font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider mb-2">Siguiente Recordatorio</span>
                        {nextRoutine ? (
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-blue-50 dark:bg-baltic-blue-950/50 text-blue-600 dark:text-baltic-blue-400 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-600 dark:text-baltic-blue-400">{nextRoutine.time}</span>
                                <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-prussian-blue-800 text-slate-500 dark:text-prussian-blue-300 px-1.5 py-0.5 rounded-md">
                                  {nextRoutine.category}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight mt-0.5">
                                {nextRoutine.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 dark:text-prussian-blue-400 leading-relaxed mt-0.5 line-clamp-1">
                                {nextRoutine.description}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 dark:text-prussian-blue-400 py-1">
                            <AlertTriangle className="w-4 h-4 text-slate-300 dark:text-prussian-blue-600" />
                            <span className="text-xs italic">No hay recordatorios pendientes para hoy</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Last Received Message Section */}
                    <div className="pt-4 flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wider mb-2">Último Mensaje Recibido</span>
                      {(() => {
                        const lastReceivedMsg = messages.filter(m => m.from === 'abuelo').slice(-1)[0];
                        if (lastReceivedMsg) {
                          return (
                            <div className="flex items-start gap-3 bg-slate-50 dark:bg-prussian-blue-800/30 border border-slate-100/50 dark:border-prussian-blue-800/40 p-3 rounded-2xl animate-fade-in">
                              <div className="w-9 h-9 bg-amber-50 dark:bg-chocolate-950/50 text-amber-700 dark:text-chocolate-400 rounded-xl flex items-center justify-center shrink-0 text-xs font-black">
                                A
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-800 dark:text-white">Abuelo</span>
                                  <span className="text-[10px] text-slate-400 dark:text-prussian-blue-400 font-semibold">
                                    {new Date(lastReceivedMsg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-650 dark:text-prussian-blue-200 mt-1 italic line-clamp-2 leading-relaxed">
                                  "{lastReceivedMsg.text}"
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <span className="text-xs text-slate-400 dark:text-prussian-blue-400 italic">No hay mensajes recibidos aún</span>
                        );
                      })()}
                    </div>
                  </div>
                )}
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
                  <Mensajeria messages={messages} setMessages={setMessages} />
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
                  <RobotStatusView 
                    isOnline={isBotOnline} 
                    setIsOnline={setIsBotOnline} 
                    isBotOn={isBotOn}
                    setIsBotOn={setIsBotOn}
                    isTracking={isTracking}
                    setIsTracking={setIsTracking}
                  />
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

        {/* Floating Radial Navigation Sidebar */}
        <RadialSidebar currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
}
