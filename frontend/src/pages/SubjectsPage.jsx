import React, { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { demoClasses, demoSubjects, demoUsers } from "../data/demoData";

export default function SubjectsPage() {
  const { user } = useAuth();

  const storedUsers = useMemo(() => {
    const saved = localStorage.getItem("erp_users");
    return saved ? JSON.parse(saved) : demoUsers;
  }, []);

  const teachers = storedUsers.filter((u) => u.role === "teacher");

  const [rows, setRows] = useState(demoSubjects);
  const [form, setForm] = useState({
    classId: "",
    subjectName: "",
    teacherId: ""
  });
  const [editingId, setEditingId] = useState(null);

  if (user.role !== "admin" && user.role !== "teacher") {
    return <div className="card">Only admin and teacher can manage subjects.</div>;
  }

  const resetForm = () => {
    setForm({ classId: "", subjectName: "", teacherId: "" });
    setEditingId(null);
  };

  const submit = (e) => {
    e.preventDefault();

    const cls = demoClasses.find((c) => c._id === form.classId);
    const teacher = teachers.find((t) => t._id === form.teacherId);

    const payload = {
      classId: cls,
      subjectName: form.subjectName,
      teacherId: teacher || null
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
        _id: `s${Date.now()}`,
        ...payload
      }
    ]);

    resetForm();
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setForm({
      classId: row.classId?._id || "",
      subjectName: row.subjectName || "",
      teacherId: row.teacherId?._id || ""
    });
  };

  const handleDelete = (rowId) => {
    const confirmDelete = window.confirm("Delete this subject?");
    if (!confirmDelete) return;
    setRows((prev) => prev.filter((item) => item._id !== rowId));
    if (editingId === rowId) resetForm();
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Subjects & Faculty Assignment"
        subtitle="Teacher and admin can assign subjects for each standard and batch"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Subjects" value={rows.length} />
        <StatCard title="Total Teachers" value={teachers.length} />
        <StatCard title="Standards / Batches" value={demoClasses.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="card space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Subject" : "Add Subject"}
          </h2>

          <div>
            <label className="label">Standard / Batch</label>
            <select
              className="input"
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              required
            >
              <option value="">Select standard / batch</option>
              {demoClasses.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.batchName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Subject Name</label>
            <input
              className="input"
              value={form.subjectName}
              onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Teacher</label>
            <select
              className="input"
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button className="btn-primary w-full">
              {editingId ? "Update Subject" : "Add Subject"}
            </button>

            {editingId && (
              <button className="btn-secondary w-full" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <Table
            columns={[
              { key: "standardName", label: "Standard", render: (row) => row.classId?.standardName || "-" },
              { key: "batch", label: "Batch", render: (row) => row.classId?.batch || "-" },
              { key: "subjectName", label: "Subject" },
              { key: "teacher", label: "Teacher", render: (row) => row.teacherId?.name || "-" },
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
            rows={rows}
          />
        </div>
      </div>
    </div>
  );
}