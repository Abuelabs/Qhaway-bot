import React from 'react';

export default function DataTable({ columns = [], data = [], emptyStateMessage = "No se encontraron registros." }) {
  return (
    <div className="w-full overflow-hidden border border-slate-100 dark:border-prussian-blue-800 rounded-3xl bg-white dark:bg-prussian-blue-900 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-prussian-blue-200">

          {/* Table Header */}
          <thead className="bg-slate-50 dark:bg-prussian-blue-800/40 border-b border-slate-100 dark:border-prussian-blue-800 text-xs font-bold text-slate-500 dark:text-prussian-blue-300 uppercase tracking-wider select-none">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-4 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-prussian-blue-800 font-medium">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-slate-50/70 dark:hover:bg-prussian-blue-800/40 transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-slate-700 dark:text-prussian-blue-200">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-400 dark:text-prussian-blue-400 font-normal"
                >
                  {emptyStateMessage}
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
