import React from "react";

export default function Table({ columns, rows, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-semibold text-slate-700"
                >
                  {col.label}
                </th>
              ))}

              {(onEdit || onDelete) && (
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700">
                      {typeof col.render === "function"
                        ? col.render(row)
                        : row[col.key]}
                    </td>
                  ))}

                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="rounded-lg bg-blue-500 px-3 py-1 text-white text-xs hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}

                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="rounded-lg bg-red-500 px-3 py-1 text-white text-xs hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}