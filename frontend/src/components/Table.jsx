import React from "react";

export default function Table({ columns, rows, onEdit, onDelete }) {
  return (
    <div className="w-full">
      {/* Mobile Card View (Visible only on small screens) */}
      <div className="grid gap-4 lg:hidden">
        {rows.length ? (
          rows.map((row, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm active:scale-[0.98] transition-transform">
              <div className="space-y-3">
                {columns.map((col) => (
                  <div key={col.key} className="flex justify-between border-b border-slate-50 pb-2 last:border-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{col.label}</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {typeof col.render === "function" ? col.render(row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>
              
              {(onEdit || onDelete) && (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="flex-1 rounded-xl bg-indigo-50 py-3 text-sm font-bold text-indigo-600 active:bg-indigo-600 active:text-white transition-colors"
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="flex-1 rounded-xl bg-red-50 py-3 text-sm font-bold text-red-600 active:bg-red-600 active:text-white transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-400">No data found.</div>
        )}
      </div>

      {/* Desktop Table View (Visible only on lg screens) */}
      <div className="hidden lg:block overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-5 font-medium text-slate-700">
                    {typeof col.render === "function" ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      {onEdit && <button onClick={() => onEdit(row)} className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-600 hover:text-white">✏️</button>}
                      {onDelete && <button onClick={() => onDelete(row)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-600 hover:text-white">🗑️</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}