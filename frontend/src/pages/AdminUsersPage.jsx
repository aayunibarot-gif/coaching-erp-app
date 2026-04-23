import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
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

// Generates a secure random password like: Tr8@kZ#mP2!
const generateStrongPassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "@#!$%&";
  const all = upper + lower + digits + symbols;
  
  // Guarantee at least one of each type
  let pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  
  // Fill the rest up to 12 characters
  for (let i = pwd.length; i < 12; i++) {
    pwd.push(all[Math.floor(Math.random() * all.length)]);
  }
  
  // Shuffle
  return pwd.sort(() => Math.random() - 0.5).join("");
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState("all");
  const [search, setSearch] = useState("");
  const [passwordMode, setPasswordMode] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setRows(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user.role === "admin" || user.role === "teacher") {
      fetchUsers();
    }
  }, [user.role]);

  if (user.role !== "admin" && user.role !== "teacher") {
    return <div className="card">Only admin and teacher can manage students.</div>;
  }

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setPasswordMode(null);
    setShowPassword(false);
    setCopied(false);
  };

  const generateStudentId = () => {
    const studentCount = rows.filter((item) => item.role === "student").length + 1;
    return `STU${String(1000 + studentCount)}`;
  };

  const generateTeacherId = () => {
    const teacherCount = rows.filter((item) => item.role === "teacher").length + 1;
    return `FAC${String(2000 + teacherCount)}`;
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      phone: form.phone,
      parentName: form.role === "student" ? form.parentName : "",
      parentPhone: form.role === "student" ? form.parentPhone : "",
      classId: form.role === "student" && form.classId ? form.classId : null,
    };

    if (form.password) {
      payload.password = form.password;
    } else if (!editingId) {
      alert("Password is required for new users");
      return;
    }

    if (!editingId) {
      payload.studentId = form.role === "student" ? generateStudentId() : generateTeacherId();
    }

    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, payload);
      } else {
        await api.post("/users", payload);
      }
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error("Failed to save user", err);
      alert(err.response?.data?.message || "Failed to save user");
    }
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

  const handleDelete = async (rowId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${rowId}`);
      fetchUsers();
      if (editingId === rowId) resetForm();
    } catch (err) {
      console.error("Failed to delete user", err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleResetPassword = (row) => {
    const newPassword = `${row.studentId || "USER"}@123`;
    alert(`Password reset successfully for ${row.name}\n\nNew Password: ${newPassword}`);
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Teachers only see students
      if (user.role === "teacher" && row.role !== "student") return false;

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

            {/* Password Mode Selector */}
            {!editingId && passwordMode === null && (
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setPasswordMode("manual")}
                  className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition text-left"
                >
                  ✏️ Create your own password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const pwd = generateStrongPassword();
                    setForm((f) => ({ ...f, password: pwd }));
                    setPasswordMode("generate");
                    setShowPassword(true);
                    setCopied(false);
                  }}
                  className="flex-1 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:border-indigo-500 hover:bg-indigo-100 transition text-left"
                >
                  ⚡ Generate strong password
                </button>
              </div>
            )}

            {/* Manual Password Input */}
            {(passwordMode === "manual" || editingId) && (
              <div className="relative mt-1">
                <input
                  className="input pr-20"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required={!editingId}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            )}

            {/* Generated Password Display */}
            {passwordMode === "generate" && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3">
                  <span className="flex-1 font-mono text-sm font-bold tracking-widest text-indigo-700">
                    {showPassword ? form.password : "••••••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(form.password);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const pwd = generateStrongPassword();
                      setForm((f) => ({ ...f, password: pwd }));
                      setCopied(false);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    🔄 Regenerate
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => { setPasswordMode(null); setForm(f => ({...f, password: ""})); }}
                    className="text-xs font-semibold text-slate-500 hover:underline"
                  >
                    ← Change method
                  </button>
                </div>
              </div>
            )}

            {passwordMode === "manual" && (
              <button
                type="button"
                onClick={() => { setPasswordMode(null); setForm(f => ({...f, password: ""})); }}
                className="mt-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                ← Change method
              </button>
            )}
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
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              pattern="[0-9]{10}"
              maxLength="10"
              minLength="10"
              title="Please enter a valid 10-digit mobile number"
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
                  type="tel"
                  placeholder="Enter 10-digit parent mobile"
                  value={form.parentPhone}
                  onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  minLength="10"
                  title="Please enter a valid 10-digit mobile number"
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