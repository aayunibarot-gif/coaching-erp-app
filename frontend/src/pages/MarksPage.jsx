import React, { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function MarksPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      if (user.role === "student") {
        const marksRes = await api.get(`/marks?studentId=${user._id}`);
        setMarks(marksRes.data);
      } else {
        // Individualized requests to avoid one failure blocking all data
        try {
          const res = await api.get("/marks");
          setMarks(res.data);
        } catch (e) { console.error("Marks fetch failed", e); }

        try {
          const res = await api.get("/users");
          setStudents(res.data.filter((u) => u.role === "student"));
        } catch (e) { console.error("Users fetch failed", e); }

        try {
          const res = await api.get("/subjects");
          setSubjects(res.data);
        } catch (e) { console.error("Subjects fetch failed", e); }

        try {
          const res = await api.get("/classes");
          setClasses(res.data);
        } catch (e) { console.error("Classes fetch failed", e); }
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

  const visibleMarks = marks;

  const [form, setForm] = useState({
    studentId: "",
    subjectId: "",
    testType: "Unit Test",
    obtainedMarks: "",
    maxMarks: "100",
    examDate: new Date().toISOString().split("T")[0]
  });

  const avgMarks = useMemo(() => {
    if (!visibleMarks.length) return 0;

    const total = visibleMarks.reduce(
      (sum, item) => sum + (item.obtainedMarks / item.maxMarks) * 100,
      0
    );

    return Math.round(total / visibleMarks.length);
  }, [visibleMarks]);

  const topPerformers = useMemo(() => {
    return students
      .map((student) => {
        const studentMarks = marks.filter(
          (m) => (m.studentId?._id || m.studentId) === student._id
        );

        const avg = studentMarks.length
          ? Math.round(
              studentMarks.reduce(
                (sum, m) => sum + (m.obtainedMarks / m.maxMarks) * 100,
                0
              ) / studentMarks.length
            )
          : 0;

        return {
          studentId: student.studentId,
          name: student.name,
          average: avg
        };
      })
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
  }, [marks, students]);

  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter((s) => s.classId?._id === selectedClassId || s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const filteredSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    return subjects.filter((s) => (s.classId?._id || s.classId) === selectedClassId);
  }, [subjects, selectedClassId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.subjectId) return;

    const payload = {
      entries: [
        {
          studentId: form.studentId,
          subjectId: form.subjectId,
          testType: form.testType,
          obtainedMarks: Number(form.obtainedMarks),
          maxMarks: Number(form.maxMarks),
          examDate: form.examDate
        }
      ]
    };

    try {
      await api.post("/marks", payload);
      setForm({ ...form, studentId: "", obtainedMarks: "" });
      fetchData();
      alert("Marks added successfully!");
    } catch (err) {
      console.error("Failed to add marks", err);
      alert("Failed to add marks");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record?")) {
      try {
        await api.delete(`/marks/${id}`);
        fetchData();
      } catch (err) {
        console.error("Failed to delete marks", err);
      }
    }
  };

  return (
    <div className="space-y-6">

      <SectionHeader
        title={user.role === "student" ? "My Test Results" : "Test & Marks Management"}
        subtitle={user.role === "student" ? "Your academic performance across all subjects" : "Track student academic performance and rankings"}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Tests" value={visibleMarks.length} />
        <StatCard title={user.role === "student" ? "Subjects" : "Students Evaluated"} value={user.role === "student" ? visibleMarks.length : students.length} />
        <StatCard title="Average Score %" value={avgMarks} />
      </div>

      {(user.role === "admin" || user.role === "teacher") && (
        <form onSubmit={submit} className="card grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <h2 className="text-xl font-bold text-slate-900">Add Marks Record</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select student, subject, and enter test performance.
            </p>
          </div>

          <div>
            <label className="label">Standard / Batch</label>
            <select
              className="input"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setForm({ ...form, studentId: "", subjectId: "" }); // Reset student and subject when class changes
              }}
              required
            >
              <option value="">Select standard / batch</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.batchName || cls.standardName}
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
            <label className="label">Subject</label>
            <select
              className="input"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              required
              disabled={!selectedClassId}
            >
              <option value="">
                {!selectedClassId ? "Select standard first" : "Select subject"}
              </option>
              {filteredSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Test Type</label>
            <select
              className="input"
              value={form.testType}
              onChange={(e) => setForm({ ...form, testType: e.target.value })}
            >
              <option>Unit Test</option>
              <option>Weekly Test</option>
              <option>Mid Term</option>
              <option>Final Exam</option>
            </select>
          </div>

          <div>
            <label className="label">Obtained Marks</label>
            <input
              className="input"
              type="number"
              value={form.obtainedMarks}
              onChange={(e) => setForm({ ...form, obtainedMarks: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Max Marks</label>
            <input
              className="input"
              type="number"
              value={form.maxMarks}
              onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Exam Date</label>
            <input
              className="input"
              type="date"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-3">
            <button className="btn-primary">Save Marks Record</button>
          </div>
        </form>
      )}

      {/* Student view: full-width personal results only */}
      {user.role === "student" && (
        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">My Test Results</h2>
          {visibleMarks.length === 0 ? (
            <p className="text-slate-500 py-6 text-center">No test results recorded yet.</p>
          ) : (
            <Table
              columns={[
                { key: "subject", label: "Subject", render: (row) => row.subjectId?.subjectName },
                { key: "testType", label: "Test Type" },
                { key: "obtainedMarks", label: "Obtained" },
                { key: "maxMarks", label: "Max" },
                {
                  key: "percent",
                  label: "Score %",
                  render: (row) => (
                    <span className={`font-bold ${
                      (row.obtainedMarks / row.maxMarks) * 100 >= 70
                        ? "text-emerald-600"
                        : (row.obtainedMarks / row.maxMarks) * 100 >= 40
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}>
                      {Math.round((row.obtainedMarks / row.maxMarks) * 100)}%
                    </span>
                  )
                },
                { key: "examDate", label: "Date" }
              ]}
              rows={visibleMarks}
            />
          )}
        </div>
      )}

      {user.role === "student" && visibleMarks.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Performance Graph</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visibleMarks.map(m => ({
                subject: m.subjectId?.subjectName || "Unknown",
                score: Math.round((m.obtainedMarks / m.maxMarks) * 100)
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Admin/Teacher view: top performers + all results */}
      {(user.role === "admin" || user.role === "teacher") && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Top Performers</h2>
            <Table
              columns={[
                { key: "studentId", label: "Student ID" },
                { key: "name", label: "Student Name" },
                { key: "average", label: "Average %" }
              ]}
              rows={topPerformers}
            />
          </div>

          <div className="card">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Test Results</h2>
            <Table
              columns={[
                { key: "student", label: "Student", render: (row) => row.studentId?.name },
                { key: "subject", label: "Subject", render: (row) => row.subjectId?.subjectName },
                { key: "testType", label: "Test Type" },
                { key: "obtainedMarks", label: "Obtained" },
                { key: "maxMarks", label: "Max" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <button
                      onClick={() => handleDelete(row._id)}
                      className="text-red-500 hover:underline text-xs font-bold"
                    >
                      Delete
                    </button>
                  )
                }
              ]}
              rows={visibleMarks}
            />
          </div>
        </div>
      )}

    </div>
  );
}