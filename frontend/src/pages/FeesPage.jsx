import React, { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { demoClasses, demoFees, demoUsers } from "../data/demo-data";

export default function FeesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState(demoFees);
  const [form, setForm] = useState({
    studentId: "",
    classId: "",
    totalAmount: "",
    paidAmount: "",
    pendingAmount: "",
    dueDate: "2026-05-10",
    status: "unpaid"
  });

  const students = demoUsers.filter((u) => u.role === "student");

  const visibleRows =
    user.role === "student"
      ? rows.filter((row) => row.studentId?._id === user._id)
      : rows;

  const totals = useMemo(() => {
    const sourceRows = user.role === "student" ? visibleRows : rows;
    const totalCollection = sourceRows.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
    const totalPending = sourceRows.reduce((sum, item) => sum + Number(item.pendingAmount || 0), 0);
    const partialCount = sourceRows.filter((item) => item.pendingAmount > 0 && item.paidAmount > 0).length;
    const overdueCount = sourceRows.filter(
      (item) => item.pendingAmount > 0 && new Date(item.dueDate) < new Date("2026-05-15")
    ).length;

    return {
      totalCollection,
      totalPending,
      partialCount,
      overdueCount
    };
  }, [rows, visibleRows]);

  const submit = (e) => {
    e.preventDefault();

    const student = students.find((s) => s._id === form.studentId);
    const cls = demoClasses.find((c) => c._id === form.classId);

    if (!student || !cls) return;

    const totalAmount = Number(form.totalAmount);
    const paidAmount = Number(form.paidAmount);
    const pendingAmount = Number(form.pendingAmount);

    let status = form.status;
    if (pendingAmount === 0 && paidAmount > 0) status = "paid";
    else if (paidAmount > 0 && pendingAmount > 0) status = "partial";
    else status = "unpaid";

    setRows((prev) => [
      {
        _id: `f${Date.now()}`,
        studentId: {
          _id: student._id,
          name: student.name,
          studentId: student.studentId,
          parentName: student.parentName,
          parentPhone: student.parentPhone
        },
        classId: cls,
        totalAmount,
        paidAmount,
        pendingAmount,
        dueDate: form.dueDate,
        status
      },
      ...prev
    ]);

    setForm({
      studentId: "",
      classId: "",
      totalAmount: "",
      paidAmount: "",
      pendingAmount: "",
      dueDate: "2026-05-10",
      status: "unpaid"
    });
  };

  const updateStatus = (rowId, newStatus) => {
    setRows((prev) =>
      prev.map((item) =>
        item._id === rowId ? { ...item, status: newStatus } : item
      )
    );
  };

  const getStatusBadge = (status) => {
    if (status === "paid") {
      return (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Paid
        </span>
      );
    }

    if (status === "partial") {
      return (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Partial
        </span>
      );
    }

    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Unpaid
      </span>
    );
  };


  return (
    <div className="space-y-6">
      <SectionHeader
        title={user.role === "student" ? "My Fee Details" : "Fees Management"}
        subtitle={user.role === "student" ? "Your tuition fee status and payment history" : "Track tuition collection, pending installments, and overdue payments"}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title={user.role === "student" ? "Total Fee" : "Total Collection"} value={`₹${totals.totalCollection}`} hint={user.role === "student" ? "Your total fee" : "Fees received so far"} />
        <StatCard title="Total Pending" value={`₹${totals.totalPending}`} hint="Outstanding amount" />
        <StatCard title="Partial Payments" value={totals.partialCount} hint="Students with installments" />
        <StatCard title="Overdue Students" value={totals.overdueCount} hint="Pending beyond due date" />
      </div>

      {(user.role === "admin" || user.role === "teacher") && (
        <form onSubmit={submit} className="card grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <h2 className="text-xl font-bold text-slate-900">Add Fee Record</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create new fee entries with installment and due-date tracking.
            </p>
          </div>

          <div>
            <label className="label">Student</label>
            <select
              className="input"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              required
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.studentId} • {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Standard</label>
            <select
              className="input"
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              required
            >
              <option value="">Select standard</option>
              {demoClasses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.standardName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Total Fee Amount</label>
            <input
              className="input"
              type="number"
              value={form.totalAmount}
              onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Paid Amount</label>
            <input
              className="input"
              type="number"
              value={form.paidAmount}
              onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Pending Amount</label>
            <input
              className="input"
              type="number"
              value={form.pendingAmount}
              onChange={(e) => setForm({ ...form, pendingAmount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Due Date</label>
            <input
              className="input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div className="md:col-span-3">
            <button className="btn-primary">Save Fee Record</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Student Fee Records</h2>
          <p className="mt-1 text-sm text-slate-500">
            View student-wise paid, pending, and overdue fee details
          </p>
        </div>

        <Table
          columns={[
            {
              key: "studentId",
              label: "Student ID",
              render: (row) => (
                <span className="font-semibold text-indigo-600">
                  {row.studentId?.studentId || "-"}
                </span>
              )
            },
            {
              key: "student",
              label: "Student Name",
              render: (row) => row.studentId?.name || "-"
            },
            {
              key: "parent",
              label: "Parent Contact",
              render: (row) =>
                row.studentId?.parentPhone || row.studentId?.parentName
                  ? `${row.studentId?.parentName || ""} ${row.studentId?.parentPhone ? `• ${row.studentId.parentPhone}` : ""}`
                  : "-"
            },
            {
              key: "class",
              label: "Standard",
              render: (row) => row.classId?.standardName || "-"
            },
            { key: "totalAmount", label: "Total Fee" },
            { key: "paidAmount", label: "Paid" },
            { key: "pendingAmount", label: "Pending" },
            { key: "dueDate", label: "Due Date" },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <div className="flex flex-col gap-2">
                  {getStatusBadge(row.status)}
                  {(user.role === "admin" || user.role === "teacher") && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => updateStatus(row._id, "paid")}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >
                        Paid
                      </button>
                      <button 
                        onClick={() => updateStatus(row._id, "partial")}
                        className="text-[10px] font-bold text-amber-600 hover:underline"
                      >
                        Partial
                      </button>
                    </div>
                  )}
                </div>
              )
            }
          ]}
          rows={visibleRows}
        />
      </div>
    </div>
  );
}