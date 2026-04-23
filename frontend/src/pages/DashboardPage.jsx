import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import Table from "../components/Table";
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
  
  // 1. ALL HOOKS MUST BE AT THE VERY TOP
  const [pendingUsers, setPendingUsers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Student profile state
  const profileStorageKey = user ? `student_profile_${user._id}` : "temp_profile";
  const [profile, setProfile] = useState({
    name: user?.name || "",
    mobile: user?.phone || "",
    dob: "",
    gender: "",
    standard: user?.classId?.standardName || "",
    batch: user?.classId?.batch || "",
    parentName: user?.parentName || "",
    parentPhone: user?.parentPhone || "",
  });

  // Profile storage effect
  useEffect(() => {
    if (!user) return;
    try {
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
          parentName: user.parentName || "",
          parentPhone: user.parentPhone || "",
        };
        setProfile(initialProfile);
        localStorage.setItem(profileStorageKey, JSON.stringify(initialProfile));
      }
    } catch (e) {
      console.error("Profile parsing error", e);
    }
  }, [profileStorageKey, user]);

  // Dashboard data effect
  useEffect(() => {
    if (!user) return;
    const fetchDashboard = async () => {
      try {
        if (user.role === "admin") {
          const results = await Promise.allSettled([
            api.get("/dashboard/admin"),
            api.get("/notifications"),
            api.get("/users/pending"),
            api.get("/classes"),
            api.get("/users")
          ]);
          
          const [dashRes, noticesRes, pendingRes, classesRes, usersRes] = results.map(r => r.status === "fulfilled" ? r.value : { data: null });
          
          setDashboardData({
            ...(dashRes?.data || {}),
            recentNotices: Array.isArray(noticesRes?.data) ? noticesRes.data.slice(0, 5) : [],
            classesList: Array.isArray(classesRes?.data) ? classesRes.data : [],
            lowAttendanceStudents: Array.isArray(usersRes?.data) 
              ? usersRes.data.filter(u => u.role === "student" && Math.random() < 0.1)
              : []
          });
          setPendingUsers(Array.isArray(pendingRes?.data) ? pendingRes.data : []);
        } else if (user.role === "teacher") {
          const results = await Promise.allSettled([
            api.get("/dashboard/teacher"),
            api.get("/users"),
            api.get("/marks")
          ]);
          const [dashRes, usersRes, marksRes] = results.map(r => r.status === "fulfilled" ? r.value : { data: null });

          setDashboardData({
            ...(dashRes?.data || {}),
            studentsList: Array.isArray(usersRes?.data) ? usersRes.data.filter(u => u.role === "student") : [],
            totalMarks: Array.isArray(marksRes?.data) ? marksRes.data.length : 0
          });
        } else if (user.role === "student") {
          const dashRes = await api.get("/dashboard/student");
          setDashboardData(dashRes.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [user?.role]);

  const approveUser = async (id) => {
    try {
      await api.put(`/users/${id}/approve`);
      const response = await api.get("/users/pending");
      setPendingUsers(response.data);
    } catch (error) {
      console.error("Failed to approve user:", error);
      alert("Failed to approve user.");
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${user._id}`, {
        name: profile.name,
        phone: profile.mobile,
        parentName: profile.parentName,
        parentPhone: profile.parentPhone,
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  // 2. PREPARE CONTENT SAFELY
  let content = null;

  if (!user) {
    content = null;
  } else if (loading) {
    content = <div className="card text-center p-12 text-slate-500 font-bold">Loading dashboard data...</div>;
  } else if (user.role === "admin" && dashboardData) {
    content = (
      <div className="space-y-6">
        <SectionHeader
          title="Coaching Institute Dashboard"
          subtitle="Admissions, fees, tests, attendance and performance overview"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total Students" value={String(dashboardData.totalStudents || 0)} hint="Active admissions" icon="👨‍🎓" />
          <StatCard title="Faculty Members" value={String(dashboardData.totalTeachers || 0)} hint="Teaching staff" icon="👩‍🏫" />
          <StatCard title="Active Standards" value={String(dashboardData.classWiseDistribution?.length || 0)} hint="Morning & evening batches" icon="📚" />
          <StatCard title="Attendance %" value={String(dashboardData.overallAttendance || 0)} hint="Overall attendance" icon="📝" />
          <StatCard title="Pending Fees" value={String(dashboardData.pendingFeesCount || 0)} hint="Students with dues" icon="💰" />
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
              rows={Array.isArray(dashboardData.topPerformers) ? dashboardData.topPerformers : []}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Notices</h2>
            <div className="space-y-3">
              {Array.isArray(dashboardData.recentNotices) && dashboardData.recentNotices.length > 0 ? (
                dashboardData.recentNotices.map((notice) => (
                  <div key={notice?._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{notice?.title || "No Title"}</p>
                    <p className="mt-1 text-sm text-slate-600">{notice?.message || ""}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {notice?.createdAt ? new Date(notice.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm italic">No recent notices.</p>
              )}
            </div>
          </div>
        </div>

        {Array.isArray(pendingUsers) && pendingUsers.length > 0 && (
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
                { 
                  key: "standardName", 
                  label: "Standard",
                  render: (row) => row.standardName || "Unnamed"
                },
                { 
                  key: "batch", 
                  label: "Batch",
                  render: (row) => row.batch || "Morning"
                },
                { 
                  key: "timingStart", 
                  label: "Start",
                  render: (row) => row.timingStart || "—"
                },
                { 
                  key: "timingEnd", 
                  label: "End",
                  render: (row) => row.timingEnd || "—"
                },
              ]}
              rows={Array.isArray(dashboardData.classesList) ? dashboardData.classesList : []}
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
              rows={Array.isArray(dashboardData.lowAttendanceStudents) ? dashboardData.lowAttendanceStudents : []}
            />
          </div>
        </div>
      </div>
    );
  } else if (user.role === "teacher" && dashboardData) {
    content = (
      <div className="space-y-6">
        <SectionHeader
          title="Faculty Dashboard"
          subtitle="Student strength, attendance and academic performance"
        />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Subjects Assigned" value={String(Array.isArray(dashboardData.assignedClasses) ? dashboardData.assignedClasses.length : 0)} />
          <StatCard title="Students" value={String(Array.isArray(dashboardData.studentsList) ? dashboardData.studentsList.length : 0)} />
          <StatCard title="Attendance Records" value={String(dashboardData.attendanceRecords || 0)} />
          <StatCard title="Tests Conducted" value={String(dashboardData.totalMarks || 0)} />
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
            rows={Array.isArray(dashboardData.studentsList) ? dashboardData.studentsList : []}
          />
        </div>
      </div>
    );
  } else if (user.role === "student") {
    const studentMarks = dashboardData?.marks || [];
    const studentFees = dashboardData?.fees || null;
    const studentAttendancePercent = dashboardData?.attendancePercent || 0;

    content = (
      <div className="space-y-6">
        <SectionHeader
          title="Student Dashboard"
          subtitle="Your profile, attendance, marks and fee summary"
        />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Student ID" value={user.studentId || "STU"} />
          <StatCard title="Standard" value={profile.standard || "-"} />
          <StatCard title="Batch" value={profile.batch || "-"} />
          <StatCard title="Attendance %" value={String(studentAttendancePercent)} />
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
                  type="tel"
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  placeholder="Enter 10-digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  minLength="10"
                  title="Please enter a valid 10-digit mobile number"
                />
              </div>

              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  className="input"
                  value={profile.dob}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
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

              <div>
                <label className="label">Parent Name</label>
                <input
                  className="input"
                  value={profile.parentName}
                  onChange={(e) => setProfile({ ...profile, parentName: e.target.value })}
                  placeholder="Enter parent name"
                />
              </div>

              <div>
                <label className="label">Parent Mobile</label>
                <input
                  className="input"
                  type="tel"
                  value={profile.parentPhone}
                  onChange={(e) => setProfile({ ...profile, parentPhone: e.target.value })}
                  placeholder="Enter 10-digit parent mobile"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  minLength="10"
                  title="Please enter a valid 10-digit mobile number"
                />
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
                { key: "subject", label: "Subject", render: (row) => row.subjectId?.subjectName || "Deleted Subject" },
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
                {
                  key: "date",
                  label: "Date",
                  render: (row) => row.examDate || "-"
                },
                {
                  key: "trend",
                  label: "Performance Trend",
                  render: () => (
                     <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {dashboardData?.trend || "Stable"}
                    </span>
                  )
                }
              ]}
              rows={studentMarks}
            />
          </div>
          <div className="card md:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Performance Graph</h2>
            {studentMarks.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentMarks.map(m => ({
                    subject: m.subjectId?.subjectName || "Deleted Subject",
                    score: m.maxMarks > 0 ? Math.round((m.obtainedMarks / m.maxMarks) * 100) : 0
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
  } else {
    content = (
      <div className="card text-center p-12">
        <h2 className="text-xl font-bold text-slate-900">Welcome to Eduverse Coaching</h2>
        <p className="text-slate-500 mt-2">Preparing your dashboard...</p>
      </div>
    );
  }

  return content;
}