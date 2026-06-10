import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ContactsView from './ContactsView';
import RoutinesView from './RoutinesView';
import Mensajeria from './Mensajeria';
import { CalendarRange, Users, MessageSquare, BookOpen, ArrowLeft } from 'lucide-react';
import { mockElderProfile, mockRoutines } from '../data/mockData';
import RoutinesProgressBar from './ui/RoutinesProgressBar';

export default function Dashboard({ adminName = "ADMIN" }) {
  const [revealed, setRevealed] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [routines, setRoutines] = useState(() => 
    mockRoutines.map(r => ({
      id: r.id,
      name: r.title || r.name,
      repeat: r.repeat !== undefined ? r.repeat : true,
      days: r.days || (r.id === 5 ? "Sá, Do" : (r.id === 2 ? "Lu, Ma, Mi, Ju, Vi" : "Todos los días")),
      time: r.time,
      description: r.desc || r.description || "",
      status: r.status || "pending",
      urgency: r.urgency || "medium",
      category: r.category || "general"
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const completedRoutines = routines.filter(r => r.status === 'completed').length;
  const totalRoutines = routines.length;
  const completionPercent = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;

  return (
    <div className="bg-slate-950 w-full min-h-screen overflow-hidden">
      <div
        style={{
          clipPath: revealed ? 'circle(150% at 50vw 50vh)' : 'circle(0% at 50vw 50vh)',
          transition: 'clip-path 4.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased"
      >
        {/* Universal Top Bar */}
        <Navbar adminName={adminName} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">

          {currentView === 'home' ? (
            <div className="space-y-8 animate-fade-in flex-1 flex flex-col justify-center py-12">
              <div className="text-center max-w-3xl mx-auto mb-8 -mt-2.5 flex flex-col items-center">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Estamos cuidando a {mockElderProfile.name}</h2>
                <p className="text-slate-500 text-sm sm:text-base mt-3">Selecciona un panel a continuación para gestionar los servicios de Qhawaybot.</p>

                {/* Reusable UI Progress Bar */}
                <RoutinesProgressBar completed={completedRoutines} total={totalRoutines} />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">

                {/* CARD 1: Rutinas */}
                <div
                  onClick={() => setCurrentView('rutinas')}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <CalendarRange className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Rutinas</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Configura tareas, medicamentos y actividades programadas.</p>
                  </div>
                </div>

                {/* CARD 2: Contactos */}
                <div
                  onClick={() => setCurrentView('contactos')}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Contactos</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Monitorea números telefónicos y prioridades de alerta SOS.</p>
                  </div>
                </div>

                {/* CARD 3: Mensajes */}
                <div
                  onClick={() => setCurrentView('mensajes')}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Mensajes</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Envía audios y comunicados de voz directamente al altavoz.</p>
                  </div>
                </div>

                {/* CARD 4: Biblioteca */}
                <div
                  onClick={() => setCurrentView('biblioteca')}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Biblioteca</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Sube audiolibros, lecturas y música de estimulación cognitiva.</p>
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
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Panel Principal
                </button>
              </div>

              {/* Conditional Views content */}
              {currentView === 'rutinas' && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
                  <RoutinesView routines={routines} setRoutines={setRoutines} />
                </div>
              )}

              {currentView === 'contactos' && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
                  <ContactsView />
                </div>
              )}
              {currentView === 'mensajes' && (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs" style={{ minHeight: '600px' }}>
                  <Mensajeria />
                </div>
              )}

              {currentView === 'biblioteca' && (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center min-h-[350px] flex flex-col items-center justify-center">
                  <BookOpen className="w-12 h-12 text-orange-500 mb-3 animate-pulse" />
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Biblioteca Digital</h3>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Esta sección está vacía. Próximamente gestionarás audiolibros y música.</p>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
