import React, { useEffect, useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function TimetablePage() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    day: "Monday",
    classId: "",
    subject: "",
    time: ""
  });

  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      const [timetableRes, classesRes] = await Promise.all([
        api.get("/timetables"),
        api.get("/classes")
      ]);
      setRows(timetableRes.data);
      setClasses(classesRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      day: "Monday",
      classId: "",
      subject: "",
      time: ""
    });
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();

    const selectedClass = classes.find((item) => item._id === form.classId);
    if (!selectedClass) return;

    const payload = {
      day: form.day,
      standard: selectedClass.standardName,
      batch: selectedClass.batch || "",
      classId: selectedClass._id,
      batchName: selectedClass.batchName || `${selectedClass.standardName} - ${selectedClass.batch}`,
      subject: form.subject,
      time: form.time
    };

    try {
      if (editingId) {
        await api.put(`/timetables/${editingId}`, payload);
      } else {
        await api.post("/timetables", payload);
      }
      fetchData();
      resetForm();
    } catch (err) {
      console.error("Failed to save timetable", err);
      alert(err.response?.data?.message || "Failed to save timetable");
    }
  };

  const handleEdit = (row) => {
    const matchedClass = classes.find(
      (item) => item._id === row.classId?._id || 
        (item.standardName === row.standard && (item.batch || "") === (row.batch || ""))
    );

    setEditingId(row._id);
    setForm({
      day: row.day || "Monday",
      classId: matchedClass?._id || "",
      subject: row.subject || "",
      time: row.time || ""
    });
  };

  const handleDelete = async (rowId) => {
    const confirmDelete = window.confirm("Delete this timetable entry?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/timetables/${rowId}`);
      fetchData();
      if (editingId === rowId) resetForm();
    } catch (err) {
      console.error("Failed to delete timetable entry", err);
      alert("Failed to delete entry");
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
          <StatCard title="Standards / Batches" value={classes.length} />
          <StatCard title="Active Schedule" value="Yes" />
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
                {classes.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.batchName || item.standardName}
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