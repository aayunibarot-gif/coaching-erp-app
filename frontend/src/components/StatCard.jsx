import React from "react";

export default function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>

      {hint && (
        <p className="mt-2 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}