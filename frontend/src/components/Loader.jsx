import React from "react";

export default function Loader({ fullScreen = false, text = "Loading..." }) {
  const wrapperClass = fullScreen
    ? "flex min-h-screen items-center justify-center"
    : "flex min-h-[300px] items-center justify-center";

  return (
    <div className={wrapperClass}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600 border-r-indigo-500" />
        </div>
        <p className="text-sm font-semibold text-slate-600">{text}</p>
      </div>
    </div>
  );
}