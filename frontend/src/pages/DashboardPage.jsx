import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import Table from "../components/Table";
import {
  demoUsers,
  demoClasses,
  demoFees,
  demoMarks,
  demoAttendanceRecords,
  demoNotices,
} from "../data/demo-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    if (user.role === "admin") {
      fetchPendingUsers();
    }
  }, [user.role]);

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get("/users/pending");
      setPendingUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
    }
  };

  const approveUser = async (id) => {
    try {
      await api.put(`/users/${id}/approve`);
      fetchPendingUsers(); // refresh the list
    } catch (error) {
      console.error("Failed to approve user:", error);
      alert("Failed to approve user.");
    }
  };

  const students = demoUsers.filter((u) => u.role === "student");
  const teachers = demoUsers.filter((u) => u.role === "teacher");
  const pendingFeeStudents = demoFees.filter((f) => f.pendingAmount > 0);
  const presentCount = demoAttendanceRecords.filter((a) => a.status === "present").length;
  const attendancePercent = demoAttendanceRecords.length
    ? Math.round((presentCount / demoAttendanceRecords.length) * 100)
    : 0;

  const lowAttendanceStudents = students
    .map((student) => {
      const records = demoAttendanceRecords.filter((a) => a.studentId._id === student._id);
      const present = records.filter((r) => r.status === "present").length;
      const percent = records.length ? Math.round((present / records.length) * 100) : 0;

      return {
        name: student.name,
        studentId: student.studentId,
        attendance: percent,
      };
    })
    .filter((s) => s.attendance < 75);

  const topPerformers = students
    .map((student) => {
      const marks = demoMarks.filter((m) => m.studentId._id === student._id);
      const avg = marks.length
        ? Math.round(
            marks.reduce(
              (sum, item) => sum + (item.obtainedMarks / item.maxMarks) * 100,
              0
            ) / marks.length
          )
        : 0;

      return {
        name: student.name,
        studentId: student.studentId,
        average: avg,
      };
    })
    .sort((a, b) => b.average - a.average)
    .slice(0, 5);

  if (user.role === "admin") {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Coaching Institute Dashboard"
          subtitle="Admissions, fees, tests, attendance and performance overview"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total Students" value={students.length} hint="Active admissions" icon="👨‍🎓" />
          <StatCard title="Faculty Members" value={teachers.length} hint="Teaching staff" icon="👩‍🏫" />
          <StatCard title="Active Standards" value={demoClasses.length} hint="Morning & evening batches" icon="📚" />
          <StatCard title="Attendance %" value={attendancePercent} hint="Overall attendance" icon="📝" />
          <StatCard title="Pending Fees" value={pendingFeeStudents.length} hint="Students with dues" icon="💰" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="card xl:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Top Performers</h2>
            <Table
              columns={[
                { key: "studentId", label: "Student ID" },
                { key: "name", label: "Student Name" },
                { key: "average", label: "Average %" },
              ]}
              rows={topPerformers}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Notices</h2>
            <div className="space-y-3">
              {demoNotices.map((notice) => (
                <div key={notice._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{notice.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notice.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{notice.createdAt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {pendingUsers.length > 0 && (
          <div className="card">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Pending Approvals</h2>
            <Table
              columns={[
                { key: "name", label: "Student Name" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
                {
                  key: "actions",
                  label: "Action",
                  render: (row) => (
                    <button
                      onClick={() => approveUser(row._id)}
                      className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                      Approve
                    </button>
                  ),
                },
              ]}
              rows={pendingUsers}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Standards & Timings</h2>
            <Table
              columns={[
                { key: "standardName", label: "Standard" },
                { key: "batch", label: "Batch" },
                { key: "timingStart", label: "Start" },
                { key: "timingEnd", label: "End" },
              ]}
              rows={demoClasses}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Low Attendance Students</h2>
            <Table
              columns={[
                { key: "studentId", label: "Student ID" },
                { key: "name", label: "Student Name" },
                { key: "attendance", label: "Attendance %" },
              ]}
              rows={lowAttendanceStudents}
            />
          </div>
        </div>
      </div>
    );
  }

  if (user.role === "teacher") {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Faculty Dashboard"
          subtitle="Student strength, attendance and academic performance"
        />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Subjects Assigned" value={5} />
          <StatCard title="Students" value={students.length} />
          <StatCard title="Attendance %" value={attendancePercent} />
          <StatCard title="Tests Conducted" value={demoMarks.length} />
        </div>

        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Students Overview</h2>
          <Table
            columns={[
              { key: "studentId", label: "Student ID" },
              { key: "name", label: "Student Name" },
              { key: "parentName", label: "Parent" },
              { key: "parentPhone", label: "Parent Mobile" },
              {
                key: "standard",
                label: "Standard / Batch",
                render: (row) => row.classId?.batchName || "-",
              },
            ]}
            rows={students}
          />
        </div>
      </div>
    );
  }

  const studentMarks = demoMarks.filter((m) => m.studentId._id === user._id);
  const studentFees = demoFees.find((f) => f.studentId._id === user._id);
  const studentAttendance = demoAttendanceRecords.filter((a) => a.studentId._id === user._id);
  const studentPresent = studentAttendance.filter((a) => a.status === "present").length;
  const studentAttendancePercent = studentAttendance.length
    ? Math.round((studentPresent / studentAttendance.length) * 100)
    : 0;

  const profileStorageKey = `student_profile_${user._id}`;

  const [profile, setProfile] = useState({
    name: user.name || "",
    mobile: user.phone || "",
    dob: "",
    gender: "",
    standard: user.classId?.standardName || "",
    batch: user.classId?.batch || "",
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem(profileStorageKey);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      const initialProfile = {
        name: user.name || "",
        mobile: user.phone || "",
        dob: "",
        gender: "",
        standard: user.classId?.standardName || "",
        batch: user.classId?.batch || "",
      };
      setProfile(initialProfile);
      localStorage.setItem(profileStorageKey, JSON.stringify(initialProfile));
    }
  }, [profileStorageKey, user]);

  const saveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    alert("Basic details updated successfully");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Student Dashboard"
        subtitle="Your profile, attendance, marks and fee summary"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Student ID" value={user.studentId || "STU"} />
        <StatCard title="Standard" value={profile.standard || "-"} />
        <StatCard title="Batch" value={profile.batch || "-"} />
        <StatCard title="Attendance %" value={studentAttendancePercent} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">My Basic Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              You can edit mobile number, date of birth, gender and personal details
            </p>
          </div>

          <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Student Name</label>
              <input
                className="input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Mobile Number</label>
              <input
                className="input"
                value={profile.mobile}
                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                className="input"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Gender</label>
              <select
                className="input"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">Standard</label>
              <input className="input" value={profile.standard} disabled />
            </div>

            <div>
              <label className="label">Batch</label>
              <input className="input" value={profile.batch} disabled />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="btn-primary w-full">
                Save Details
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Fee Summary</h2>
          {studentFees ? (
            <div className="space-y-3 text-sm text-slate-700">
              <p><strong>Total Fee:</strong> ₹{studentFees.totalAmount}</p>
              <p><strong>Paid Fee:</strong> ₹{studentFees.paidAmount}</p>
              <p><strong>Pending Fee:</strong> ₹{studentFees.pendingAmount}</p>
              <p><strong>Status:</strong> {studentFees.status}</p>
              <p><strong>Due Date:</strong> {studentFees.dueDate}</p>
            </div>
          ) : (
            <p className="text-slate-500">No fee record found.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Latest Marks</h2>
          <Table
            columns={[
              { key: "subject", label: "Subject", render: (row) => row.subjectId.subjectName },
              { key: "testType", label: "Test Type" },
              { key: "obtainedMarks", label: "Obtained" },
              { key: "maxMarks", label: "Max" },
            ]}
            rows={studentMarks}
          />
        </div>

        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Attendance Records</h2>
          <Table
            columns={[
              { key: "date", label: "Date" },
              {
                key: "status",
                label: "Status",
                render: (row) =>
                  row.status === "present" ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Present
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      Absent
                    </span>
                  ),
              },
            ]}
            rows={studentAttendance}
          />
        </div>
        <div className="card md:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Performance Graph</h2>
          {studentMarks.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentMarks.map(m => ({
                  subject: m.subjectId.subjectName,
                  score: Math.round((m.obtainedMarks / m.maxMarks) * 100)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500">No test results to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}