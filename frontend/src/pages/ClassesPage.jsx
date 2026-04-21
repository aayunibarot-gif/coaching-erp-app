import React, { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import { useAuth } from "../context/AuthContext";
import { demoClasses } from "../data/demo-data";

export default function ClassesPage() {
  const { user } = useAuth();

  const [rows, setRows] = useState(demoClasses);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    standardName: "",
    batch: "Morning"
  });

  if (user.role !== "admin" && user.role !== "teacher") {
    return <div className="card">Only admin and teacher can manage standards.</div>;
  }

  const resetForm = () => {
    setForm({
      standardName: "",
      batch: "Morning"
    });
    setEditingId(null);
  };

  const submit = (e) => {
    e.preventDefault();

    const payload = {
      standardName: form.standardName,
      batch: form.batch,
      batchName: `${form.standardName} - ${form.batch}`
    };

    if (editingId) {
      setRows((prev) =>
        prev.map((item) =>
          item._id === editingId ? { ...item, ...payload } : item
        )
      );
      resetForm();
      return;
    }

    const newClass = {
      _id: Date.now().toString(),
      ...payload
    };

    setRows((prev) => [...prev, newClass]);
    resetForm();
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setForm({
      standardName: row.standardName || "",
      batch: row.batch || "Morning"
    });
  };

  const handleDelete = (rowId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this standard?");
    if (!confirmDelete) return;

    setRows((prev) => prev.filter((item) => item._id !== rowId));

    if (editingId === rowId) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Standards"
        subtitle="Manage coaching batches"
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label">Standard</label>
            <input
              className="input"
              value={form.standardName}
              onChange={(e) =>
                setForm({ ...form, standardName: e.target.value })
              }
              placeholder="Example: 11th"
              required
            />
          </div>

          <div>
            <label className="label">Batch</label>
            <select
              className="input"
              value={form.batch}
              onChange={(e) =>
                setForm({ ...form, batch: e.target.value })
              }
            >
              <option>Morning</option>
              <option>Evening</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button className="btn-primary w-full" type="submit">
              {editingId ? "Update Standard" : "Add Standard"}
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
              { key: "standardName", label: "Standard" },
              { key: "batch", label: "Batch" },
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