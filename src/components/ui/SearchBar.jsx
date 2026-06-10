import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ placeholder = "Buscar...", value, onChange }) {
  return (
    <div className="relative w-full max-w-sm">
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition"
      />
    </div>
  );
}
