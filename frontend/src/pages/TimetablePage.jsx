import React, { useEffect, useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { demoClasses, demoSubjects, demoTimetable } from "../data/demoData";

export default function TimetablePage() {
  const { user } = useAuth();

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem("erp_timetable");
    return saved ? JSON.parse(saved) : demoTimetable;
  });

  const [form, setForm] = useState({
    day: "Monday",
    classId: "",
    subject: "",
    time: ""
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("erp_timetable", JSON.stringify(rows));
  }, [rows]);

  const resetForm = () => {
    setForm({
      day: "Monday",
      classId: "",
      subject: "",
      time: ""
    });
    setEditingId(null);
  };

  const submit = (e) => {
    e.preventDefault();

    const selectedClass = demoClasses.find((item) => item._id === form.classId);

    if (!selectedClass) return;

    const payload = {
      day: form.day,
      standard: selectedClass.standardName,
      batch: selectedClass.batch || "",
      batchName: selectedClass.batchName || `${selectedClass.standardName} - ${selectedClass.batch}`,
      subject: form.subject,
      time: form.time
    };

    if (editingId) {
      setRows((prev) =>
        prev.map((item) => (item._id === editingId ? { ...item, ...payload } : item))
      );
      resetForm();
      return;
    }

    setRows((prev) => [
      ...prev,
      {
        _id: `t${Date.now()}`,
        ...payload
      }
    ]);

    resetForm();
  };

  const handleEdit = (row) => {
    const matchedClass = demoClasses.find(
      (item) =>
        item.standardName === row.standard &&
        (item.batch || "") === (row.batch || "")
    );

    setEditingId(row._id);
    setForm({
      day: row.day || "Monday",
      classId: matchedClass?._id || "",
      subject: row.subject || "",
      time: row.time || ""
    });
  };

  const handleDelete = (rowId) => {
    const confirmDelete = window.confirm("Delete this timetable entry?");
    if (!confirmDelete) return;

    setRows((prev) => prev.filter((item) => item._id !== rowId));

    if (editingId === rowId) {
      resetForm();
    }
  };

  const studentRows = useMemo(() => {
    if (!user?.classId) return [];

    return rows.filter(
      (item) =>
        item.standard === user.classId.standardName &&
        (item.batch || "") === (user.classId.batch || "")
    );
  }, [rows, user]);

  const teacherRows = rows;

  if (user?.role === "student") {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="My Timetable"
          subtitle={`Class schedule for ${user.classId?.batchName || user.classId?.standardName || "your batch"}`}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Standard" value={user.classId?.standardName || "-"} />
          <StatCard title="Batch" value={user.classId?.batch || "-"} />
          <StatCard title="Total Classes" value={studentRows.length} />
        </div>

        <div className="card">
          <Table
            columns={[
              { key: "day", label: "Day" },
              { key: "subject", label: "Subject" },
              { key: "time", label: "Class Time" }
            ]}
            rows={studentRows}
          />
        </div>
      </div>
    );
  }

  if (user?.role === "teacher" || user?.role === "admin") {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Class Timetable"
          subtitle="Timetable updated here will also be visible to students of the respective standard and batch"
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Classes" value={rows.length} />
          <StatCard title="Standards / Batches" value={demoClasses.length} />
          <StatCard title="Subjects Covered" value={demoSubjects.length} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form onSubmit={submit} className="card space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Timetable" : "Add Timetable Entry"}
            </h2>

            <div>
              <label className="label">Day</label>
              <select
                className="input"
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
              </select>
            </div>

            <div>
              <label className="label">Standard / Batch</label>
              <select
                className="input"
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                required
              >
                <option value="">Select standard / batch</option>
                {demoClasses.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.batchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Subject</label>
              <input
                className="input"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Mathematics"
                required
              />
            </div>

            <div>
              <label className="label">Class Time</label>
              <input
                className="input"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="08:00 AM - 09:00 AM"
                required
              />
            </div>

            <div className="flex gap-3">
              <button className="btn-primary w-full" type="submit">
                {editingId ? "Update Timetable" : "Add Timetable"}
              </button>

              {editingId && (
                <button
                  className="btn-secondary w-full"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="card">
            <Table
              columns={[
                { key: "day", label: "Day" },
                { key: "standard", label: "Standard" },
                { key: "batch", label: "Batch" },
                { key: "subject", label: "Subject" },
                { key: "time", label: "Class Time" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(row)}
                        className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row._id)}
                        className="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  )
                }
              ]}
              rows={teacherRows}
            />
          </div>
        </div>
      </div>
    );
  }

  return <div className="card">No timetable available.</div>;
}