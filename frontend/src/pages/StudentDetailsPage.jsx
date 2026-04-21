import React from "react";
import { Navigate, useParams } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import {
  demoAttendanceRecords,
  demoFees,
  demoMarks,
  demoUsers
} from "../data/demo-data";

export default function StudentDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();

  if (user?.role !== "admin") {
    return <Navigate to="/users" replace />;
  }

  const student =
    demoUsers.find((u) => u._id === id) ||
    demoUsers.find((u) => u.role === "student");

  const marks = demoMarks.filter((m) => m.studentId._id === student._id);
  const attendance = demoAttendanceRecords.filter(
    (a) => a.studentId._id === student._id
  );
  const fees = demoFees.find((f) => f.studentId._id === student._id);

  const present = attendance.filter((a) => a.status === "present").length;
  const attendancePercent = attendance.length
    ? Math.round((present / attendance.length) * 100)
    : 0;

  const avgMarks = marks.length
    ? Math.round(
        marks.reduce(
          (sum, item) => sum + (item.obtainedMarks / item.maxMarks) * 100,
          0
        ) / marks.length
      )
    : 0;

  const handleResetPassword = () => {
    const newPassword = `${student.studentId}@123`;
    alert(`Password reset successfully for ${student.name}\n\nNew Password: ${newPassword}`);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={student.name}
        subtitle={`${student.studentId || "-"} • ${student.classId?.batchName || "-"} • ${student.email}`}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Attendance %" value={attendancePercent} />
        <StatCard title="Average Marks" value={avgMarks} />
        <StatCard title="Pending Fees" value={fees?.pendingAmount || 0} />
        <StatCard title="Admission Date" value={student.admissionDate || "-"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Student Profile</h2>

          <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-700">
            <p><strong>Student ID:</strong> {student.studentId || "-"}</p>
            <p><strong>Student Mobile:</strong> {student.phone || "-"}</p>
            <p><strong>Parent Name:</strong> {student.parentName || "-"}</p>
            <p><strong>Parent Mobile:</strong> {student.parentPhone || "-"}</p>
            <p><strong>Standard:</strong> {student.classId?.standardName || "-"}</p>
            <p><strong>Batch:</strong> {student.classId?.batch || "-"}</p>
            <p><strong>Email:</strong> {student.email}</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="btn-primary" onClick={handleResetPassword}>
              Reset Password
            </button>
            <button className="btn-secondary">Print Credentials</button>
            <button className="btn-secondary">Send Notice</button>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Fee Summary</h2>
          {fees ? (
            <div className="space-y-3 text-sm text-slate-700">
              <p><strong>Total Fee:</strong> ₹{fees.totalAmount}</p>
              <p><strong>Paid Fee:</strong> ₹{fees.paidAmount}</p>
              <p><strong>Pending Fee:</strong> ₹{fees.pendingAmount}</p>
              <p><strong>Status:</strong> {fees.status}</p>
              <p><strong>Due Date:</strong> {fees.dueDate}</p>
            </div>
          ) : (
            <p className="text-slate-500">No fee record found.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Marks</h2>
          <Table
            columns={[
              {
                key: "subject",
                label: "Subject",
                render: (row) => row.subjectId.subjectName,
              },
              { key: "testType", label: "Test Type" },
              { key: "obtainedMarks", label: "Obtained" },
              { key: "maxMarks", label: "Max" },
            ]}
            rows={marks}
          />
        </div>

        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Attendance</h2>
          <Table
            columns={[
              { key: "date", label: "Date" },
              { key: "status", label: "Status" },
            ]}
            rows={attendance}
          />
        </div>
      </div>
    </div>
  );
}