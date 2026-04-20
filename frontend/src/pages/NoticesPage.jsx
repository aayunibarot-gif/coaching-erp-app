import React from "react";
import SectionHeader from "../components/SectionHeader";
import { demoNotices } from "../data/demoData";

export default function NoticesPage() {
  return (
    <div className="space-y-6">

      <SectionHeader
        title="Institute Notices"
        subtitle="Important announcements for students and parents"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {demoNotices.map((notice) => (
          <div
            key={notice._id}
            className="card hover:shadow-lg transition"
          >

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900">
                {notice.title}
              </h2>

              <span className="text-xs text-slate-500">
                {notice.createdAt}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {notice.message}
            </p>

            <div className="mt-4 flex gap-2">

              <button className="btn-secondary text-xs">
                Edit
              </button>

              <button className="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-200">
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}