import React from 'react';

export default function FilterSelect({ options = [], value, onChange, label }) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={onChange}
        className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
