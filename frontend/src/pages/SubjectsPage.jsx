import React, { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function SubjectsPage() {
  const { user } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    classId: "",
    subjectName: "",
    teacherId: ""
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes, usersRes] = await Promise.all([
        api.get("/subjects"),
        api.get("/classes"),
        api.get("/users")
      ]);
      setRows(subjectsRes.data);
      setClasses(classesRes.data);
      setTeachers(usersRes.data.filter((u) => u.role === "teacher"));
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user.role === "admin" || user.role === "teacher") {
      fetchData();
    }
  }, [user.role]);

  if (user.role !== "admin" && user.role !== "teacher") {
    return <div className="card">Only admin and teacher can manage subjects.</div>;
  }

  const resetForm = () => {
    setForm({ classId: "", subjectName: "", teacherId: "" });
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      classId: form.classId,
      subjectName: form.subjectName,
      teacherId: form.teacherId || null
    };

    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, payload);
      } else {
        await api.post("/subjects", payload);
      }
      fetchData();
      resetForm();
    } catch (err) {
      console.error("Failed to save subject", err);
      alert(err.response?.data?.message || "Failed to save subject");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setForm({
      classId: row.classId?._id || "",
      subjectName: row.subjectName || "",
      teacherId: row.teacherId?._id || ""
    });
  };

  const handleDelete = async (rowId) => {
    const confirmDelete = window.confirm("Delete this subject?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/subjects/${rowId}`);
      fetchData();
      if (editingId === rowId) resetForm();
    } catch (err) {
      console.error("Failed to delete subject", err);
      alert(err.response?.data?.message || "Failed to delete subject");
    }
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
        <StatCard title="Standards / Batches" value={classes.length} />
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
              {classes.map((cls) => (
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
          {/* Optional Teacher Assignment - Hidden/Minimized as per '2 fields' request, but kept logic for compatibility */}
          <input type="hidden" value={form.teacherId} />

          <div className="flex gap-3 pt-2">
            <button className="btn-primary w-full">
              {editingId ? "Update Subject" : "➕ Add Subject to Standard"}
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