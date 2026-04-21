import React from "react";

export default function StatCard({ title, value, hint, icon }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-white p-5 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group active:scale-[0.98]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl group-hover:bg-indigo-50 transition-colors">
          {icon || "📊"}
        </div>
      </div>

      {hint && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="h-1 w-1 rounded-full bg-indigo-500"></span>
          {hint}
        </div>
      )}
    </div>
  );
}