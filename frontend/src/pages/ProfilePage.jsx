import React, { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";
import { demoClasses } from "../data/demo-data";

export default function ProfilePage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    phone: user?.phone || "",
    parentName: user?.parentName || "",
    parentPhone: user?.parentPhone || "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // In a real app this would call an API to update the user
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Profile"
        subtitle="View your details and update your contact information"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Read-only details set by Admin */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Academic Details</h2>
          <p className="text-sm text-slate-500">
            These details are managed by your institute.
          </p>

          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-500">Student ID</span>
              <span className="text-sm font-bold text-slate-900">{user?.studentId || "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-500">Full Name</span>
              <span className="text-sm font-bold text-slate-900">{user?.name || "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-500">Email</span>
              <span className="text-sm font-bold text-slate-900">{user?.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3 border border-indigo-100">
              <span className="text-sm font-semibold text-indigo-600">Standard</span>
              <span className="text-sm font-bold text-indigo-700">
                {user?.classId?.standardName || "Not assigned yet"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3 border border-indigo-100">
              <span className="text-sm font-semibold text-indigo-600">Batch</span>
              <span className="text-sm font-bold text-indigo-700">
                {user?.classId?.batch || "Not assigned yet"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-500">Admission Date</span>
              <span className="text-sm font-bold text-slate-900">{user?.admissionDate || "—"}</span>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-xs text-amber-700 font-semibold">
              ℹ️ Standard and Batch are assigned by your teacher or admin. Contact them if you need changes.
            </p>
          </div>
        </div>

        {/* Editable contact details */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Contact Details</h2>
          <p className="text-sm text-slate-500">Update your mobile and parent contact info.</p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Your Mobile Number</label>
              <input
                className="input"
                type="tel"
                placeholder="Enter your mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Parent / Guardian Name</label>
              <input
                className="input"
                type="text"
                placeholder="Enter parent name"
                value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Parent / Guardian Mobile</label>
              <input
                className="input"
                type="tel"
                placeholder="Enter parent mobile"
                value={form.parentPhone}
                onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Save Changes
            </button>

            {saved && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 text-center">
                ✅ Details saved successfully!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
