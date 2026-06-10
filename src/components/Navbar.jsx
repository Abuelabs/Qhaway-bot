import React from 'react';
import { Heart } from 'lucide-react';

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
            </span>
          </div>
        </div>

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
        </div>

      </div>
    </header>
  );
}
