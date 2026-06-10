import React from 'react';

export default function DataTable({ columns = [], data = [], emptyStateMessage = "No se encontraron registros." }) {
  return (
    <div className="w-full overflow-hidden border border-slate-100 rounded-3xl bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-600">
          
          {/* Table Header */}
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-4 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 font-medium">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex} 
                  className="hover:bg-slate-50/70 transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-slate-700">
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
                  className="px-6 py-12 text-center text-slate-400 font-normal"
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
