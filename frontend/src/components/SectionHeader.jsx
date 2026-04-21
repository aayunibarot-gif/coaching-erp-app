import React from "react";

export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-8 mt-4 lg:mt-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1.5 rounded-full bg-indigo-600"></div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">{title}</h1>
      </div>
      {subtitle ? (
        <p className="mt-2 text-sm font-medium text-slate-500 max-w-2xl">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
