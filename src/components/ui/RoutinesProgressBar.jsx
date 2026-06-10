import React from 'react';

export default function RoutinesProgressBar({ completed = 0, total = 0 }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full max-w-3xl mt-5 px-1">
      {/* Descriptive single line header with readable black text */}
<<<<<<< HEAD
      <div className="flex justify-between items-center text-xs font-bold text-slate-950 mb-1.5 tracking-tight">
=======
      <div className="flex justify-between items-center text-xs font-bold text-slate-950 dark:text-white mb-1.5 tracking-tight">
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
        <span>Avance de Rutinas</span>
        <span>{percentage}% ({completed} de {total} completadas)</span>
      </div>

      {/* Slim progress bar track */}
<<<<<<< HEAD
      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          style={{ width: `${percentage}%` }}
          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
=======
      <div className="w-full h-2.5 bg-slate-200 dark:bg-prussian-blue-800 rounded-full overflow-hidden">
        <div
          style={{ width: `${percentage}%` }}
          className="h-full bg-blue-600 dark:bg-baltic-blue-500 rounded-full transition-all duration-1000 ease-out"
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
        ></div>
      </div>
    </div>
  );
}
