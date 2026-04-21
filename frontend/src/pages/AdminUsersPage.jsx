import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import { useAuth } from "../context/AuthContext";
import { demoClasses, demoUsers } from "../data/demo-data";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "student",
  phone: "",
  parentName: "",
  parentPhone: "",
  classId: ""
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem("erp_users");
    return saved ? JSON.parse(saved) : demoUsers;
  });

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("erp_users", JSON.stringify(rows));
  }, [rows]);

  if (user.role !== "admin" && user.role !== "teacher") {
    return <div className="card">Only admin and teacher can manage students.</div>;
  }

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const generateStudentId = () => {
    const studentCount = rows.filter((item) => item.role === "student").length + 1;
    return `STU${String(1000 + studentCount)}`;
  };

  const generateTeacherId = () => {
    const teacherCount = rows.filter((item) => item.role === "teacher").length + 1;
    return `FAC${String(2000 + teacherCount)}`;
  };

  const submit = (e) => {
    e.preventDefault();

    const selectedClass = demoClasses.find((c) => c._id === form.classId) || null;

    if (editingId) {
      setRows((prev) =>
        prev.map((item) =>
          item._id === editingId
            ? {
                ...item,
                name: form.name,
                email: form.email,
                role: form.role,
                phone: form.phone,
                parentName: form.parentName,
                parentPhone: form.parentPhone,
                classId: form.role === "student" ? selectedClass : null
              }
            : item
        )
      );
      resetForm();
      return;
    }

    const newUser = {
      _id: `u${Date.now()}`,
      studentId:
        form.role === "student"
          ? generateStudentId()
          : form.role === "teacher"
          ? generateTeacherId()
          : `ADM${Date.now().toString().slice(-3)}`,
      name: form.name,
      email: form.email,
      role: form.role,
      phone: form.phone,
      parentName: form.role === "student" ? form.parentName : "",
      parentPhone: form.role === "student" ? form.parentPhone : "",
      classId: form.role === "student" ? selectedClass : null,
      admissionDate: "2026-04-18"
    };

    setRows((prev) => [newUser, ...prev]);
    resetForm();
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setForm({
      name: row.name || "",
      email: row.email || "",
      password: "",
      role: row.role || "student",
      phone: row.phone || "",
      parentName: row.parentName || "",
      parentPhone: row.parentPhone || "",
      classId: row.classId?._id || ""
    });
  };

  const handleDelete = (rowId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    setRows((prev) => prev.filter((item) => item._id !== rowId));

    if (editingId === rowId) {
      resetForm();
    }
  };

  const handleResetPassword = (row) => {
    const newPassword = `${row.studentId || "USER"}@123`;
    alert(`Password reset successfully for ${row.name}\n\nNew Password: ${newPassword}`);
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchStandard =
        selectedStandard === "all" || row.classId?._id === selectedStandard;

      const matchSearch =
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        (row.studentId || "").toLowerCase().includes(search.toLowerCase()) ||
        (row.parentName || "").toLowerCase().includes(search.toLowerCase());

      return matchStandard && matchSearch;
    });
  }, [rows, selectedStandard, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Student & Staff Management"
        subtitle={
          user.role === "admin"
            ? "Admin can manage all records and open student profile details"
            : "Teacher can manage records and reset student passwords"
        }
      />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="card space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit Record" : "Add New Student / Staff"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Teacher and admin both can add and update records.
            </p>
          </div>

          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              Password {editingId ? "(leave blank to keep same)" : ""}
            </label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingId}
            />
          </div>

          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              {user.role === "admin" && <option value="admin">Admin</option>}
            </select>
          </div>

          <div>
            <label className="label">Mobile</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {form.role === "student" && (
            <>
              <div>
                <label className="label">Parent Name</label>
                <input
                  className="input"
                  value={form.parentName}
                  onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Parent Mobile</label>
                <input
                  className="input"
                  value={form.parentPhone}
                  onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Standard / Batch</label>
                <select
                  className="input"
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                >
                  <option value="">Select Standard / Batch</option>
                  {demoClasses.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.batchName}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button className="btn-primary w-full" type="submit">
              {editingId ? "Update Record" : "Create Record"}
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

        <div className="space-y-4">
          <div className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student / Staff List</h3>
              <p className="text-sm text-slate-500">
                Search and filter records quickly.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="input"
                placeholder="Search by name / ID / parent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="input"
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
              >
                <option value="all">All Standards / Batches</option>
                {demoClasses.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.batchName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card">
            <Table
              columns={[
                {
                  key: "studentId",
                  label: "ID",
                  render: (row) => (
                    <span className="font-semibold text-indigo-600">
                      {row.studentId || "-"}
                    </span>
                  )
                },
                {
                  key: "name",
                  label: "Name",
                  render: (row) =>
                    row.role === "student" && user.role === "admin" ? (
                      <button
                        className="font-semibold text-blue-600 hover:underline"
                        onClick={() => navigate(`/students/${row._id}`)}
                      >
                        {row.name}
                      </button>
                    ) : (
                      row.name
                    )
                },
                { key: "role", label: "Role" },
                {
                  key: "parentName",
                  label: "Parent",
                  render: (row) => row.parentName || "-"
                },
                {
                  key: "parentPhone",
                  label: "Parent Mobile",
                  render: (row) => row.parentPhone || "-"
                },
                {
                  key: "standard",
                  label: "Standard / Batch",
                  render: (row) => row.classId?.batchName || "-"
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <div className="flex flex-wrap gap-2">
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
                      {row.role === "student" && (
                        <button
                          type="button"
                          onClick={() => handleResetPassword(row)}
                          className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200"
                        >
                          Reset Password
                        </button>
                      )}
                    </div>
                  )
                }
              ]}
              rows={filteredRows}
            />
          </div>
        </div>
      </div>
    </div>
  );
}