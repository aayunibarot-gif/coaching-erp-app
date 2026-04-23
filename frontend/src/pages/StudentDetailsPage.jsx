import React from "react";
import { Navigate, useParams } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function StudentDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/users/student/${id}/details`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch student details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (user?.role !== "admin") {
    return <Navigate to="/users" replace />;
  }

  if (loading) return <div className="card text-center p-12 text-slate-500 font-semibold">Loading student details...</div>;
  if (!data) return <div className="card text-center p-12 text-red-500 font-semibold">Student details not found.</div>;

  const { student, attendance, marks, fees, summary } = data;

  const handleResetPassword = async () => {
    const confirm = window.confirm(`Are you sure you want to reset password for ${student.name}?`);
    if (!confirm) return;
    
    try {
      const newPassword = `${student.studentId || "Student"}@123`;
      await api.put(`/users/${student._id}`, { password: newPassword });
      alert(`Password reset successfully for ${student.name}\n\nNew Password: ${newPassword}`);
    } catch (err) {
      console.error(err);
      alert("Failed to reset password.");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={student.name}
        subtitle={`${student.studentId || "-"} • ${student.classId?.batchName || "-"} • ${student.email}`}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Attendance %" value={summary.attendancePercent} />
        <StatCard title="Average Marks" value={summary.avgMarks} />
        <StatCard title="Pending Fees" value={summary.pendingFees} />
        <StatCard title="Admission Date" value={new Date(student.createdAt).toLocaleDateString() || "-"} />
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
            <button className="btn-secondary" onClick={() => window.print()}>Print Credentials</button>
            <button className="btn-secondary">Send Notice</button>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Fee Summary</h2>
          {fees && fees.length > 0 ? (
            <div className="space-y-3 text-sm text-slate-700">
              <p><strong>Latest Total Fee:</strong> ₹{fees[0].totalAmount}</p>
              <p><strong>Latest Paid Fee:</strong> ₹{fees[0].paidAmount}</p>
              <p><strong>Latest Pending Fee:</strong> ₹{fees[0].pendingAmount}</p>
              <p><strong>Status:</strong> {fees[0].status}</p>
              <p><strong>Due Date:</strong> {fees[0].dueDate}</p>
              <p className="pt-2 font-bold text-indigo-600">Total Outstanding: ₹{summary.pendingFees}</p>
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