import React, { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function FeesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");


  const fetchData = async () => {
    try {
      if (user.role === "student") {
        const feesRes = await api.get(`/fees?studentId=${user._id}`);
        setRows(Array.isArray(feesRes.data) ? feesRes.data : []);
      } else {
        // Individualized requests for robustness
        try {
          const res = await api.get("/fees");
          setRows(Array.isArray(res.data) ? res.data : []);
        } catch (e) { 
          console.error("Fees fetch failed", e);
          setRows([]);
        }

        try {
          const res = await api.get("/users");
          setStudents(Array.isArray(res.data) ? res.data.filter((u) => u.role === "student") : []);
        } catch (e) { 
          console.error("Users fetch failed", e);
          setStudents([]);
        }

        try {
          const res = await api.get("/classes");
          setClasses(Array.isArray(res.data) ? res.data : []);
        } catch (e) { 
          console.error("Classes fetch failed", e);
          setClasses([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [user._id, user.role]);

  const visibleRows = rows;

  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter((s) => (s.classId?._id || s.classId) === selectedClassId);
  }, [students, selectedClassId]);

  const totals = useMemo(() => {
    const sourceRows = user.role === "student" ? visibleRows : rows;
    const totalCollection = sourceRows.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
    const totalPending = sourceRows.reduce((sum, item) => sum + Number(item.pendingAmount || 0), 0);
    const partialCount = sourceRows.filter((item) => item.pendingAmount > 0 && item.paidAmount > 0).length;
    const overdueCount = sourceRows.filter(
      (item) => item.pendingAmount > 0 && new Date(item.dueDate) < new Date()
    ).length;

    return {
      totalCollection,
      totalPending,
      partialCount,
      overdueCount
    };
  }, [rows, visibleRows]);

  const [form, setForm] = useState({
    studentId: "",
    totalAmount: "",
    paidAmount: "",
    pendingAmount: "",
    dueDate: new Date().toISOString().split("T")[0],
    status: "unpaid"
  });



  const submit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !selectedClassId) return;

    const payload = {
      studentId: form.studentId,
      classId: selectedClassId,
      totalAmount: Number(form.totalAmount),
      paidAmount: Number(form.paidAmount),
      pendingAmount: Number(form.pendingAmount),
      dueDate: form.dueDate,
    };

    try {
      await api.post("/fees", payload);
      setForm({
        studentId: "",
        totalAmount: "",
        paidAmount: "",
        pendingAmount: "",
        dueDate: new Date().toISOString().split("T")[0],
        status: "unpaid"
      });
      fetchData();
      alert("Fee record added successfully!");
    } catch (err) {
      console.error("Failed to add fee record", err);
      const msg = err.response?.data?.message || "Failed to add fee record";
      alert(msg);
    }
  };

  const updateStatus = async (rowId, newStatus) => {
    try {
      await api.put(`/fees/${rowId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const downloadReceipt = (row) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("Eduverse Coaching", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("Fee Payment Receipt", 105, 30, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Student: ${row.studentId?.name || "N/A"}`, 14, 45);
    doc.text(`Roll No: ${row.studentId?.studentId || "N/A"}`, 14, 52);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 45);

    doc.autoTable({
      startY: 60,
      head: [["Description", "Amount"]],
      body: [
        ["Total Fee", `Rs. ${row.totalAmount}`],
        ["Paid Amount", `Rs. ${row.paidAmount}`],
        ["Pending Amount", `Rs. ${row.pendingAmount}`],
        ["Due Date", new Date(row.dueDate).toLocaleDateString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`Status: ${row.status.toUpperCase()}`, 105, finalY, { align: "center" });

    doc.save(`Fee_Receipt_${row.studentId?.name || "Student"}.pdf`);
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
            <label className="label">Standard / Batch</label>
            <select
              className="input"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setForm({ ...form, studentId: "" });
              }}
              required
            >
              <option value="">Select standard / batch</option>
              {classes.length === 0 && (
                <option disabled>No standards found. Please add them first.</option>
              )}
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.batchName || c.standardName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Student</label>
            <select
              className="input"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              required
              disabled={!selectedClassId}
            >
              <option value="">
                {!selectedClassId ? "Select standard first" : "Select student"}
              </option>
              {filteredStudents.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.studentId} • {s.name}
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
              onChange={(e) => {
                const total = Number(e.target.value) || 0;
                const paid = Number(form.paidAmount) || 0;
                setForm({ 
                  ...form, 
                  totalAmount: e.target.value, 
                  pendingAmount: Math.max(0, total - paid) 
                });
              }}
              required
            />
          </div>

          <div>
            <label className="label">Paid Amount</label>
            <input
              className="input"
              type="number"
              value={form.paidAmount}
              onChange={(e) => {
                const total = Number(form.totalAmount) || 0;
                const paid = Number(e.target.value) || 0;
                setForm({ 
                  ...form, 
                  paidAmount: e.target.value, 
                  pendingAmount: Math.max(0, total - paid) 
                });
              }}
              required
            />
          </div>

          <div>
            <label className="label">Pending Amount</label>
            <input
              type="number"
              value={form.pendingAmount}
              readOnly
              className="input bg-slate-50"
            />
          </div>

          <div>
            <label className="label">Due Date</label>
            <input
              className="input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
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
              render: (row) => row.classId?.batchName || row.classId?.standardName || "-"
            },
            { key: "totalAmount", label: "Total Fee", render: (row) => `₹${row.totalAmount}` },
            { key: "paidAmount", label: "Paid", render: (row) => `₹${row.paidAmount}` },
            { key: "pendingAmount", label: "Pending", render: (row) => `₹${row.pendingAmount}` },
            { key: "dueDate", label: "Due Date" },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex flex-col gap-2 items-start">
                  {getStatusBadge(row.status)}
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => downloadReceipt(row)}
                      className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      📄 Receipt
                    </button>
                  </div>
                  {(user.role === "admin" || user.role === "teacher") && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateStatus(row._id, "paid")}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >
                        Set Paid
                      </button>
                      <button 
                        onClick={() => updateStatus(row._id, "partial")}
                        className="text-[10px] font-bold text-amber-600 hover:underline"
                      >
                        Set Partial
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