import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ placeholder = "Buscar...", value, onChange }) {
  return (
    <div className="relative w-full max-w-sm">
<<<<<<< HEAD
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
=======
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-prussian-blue-400">
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
        <Search className="w-4 h-4" />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
<<<<<<< HEAD
        className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition"
=======
        className="w-full bg-white dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-prussian-blue-50 placeholder-slate-400 dark:placeholder-prussian-blue-500 outline-hidden focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-baltic-blue-500/25 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition"
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
      />
    </div>
  );
}
