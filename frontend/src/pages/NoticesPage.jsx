import React, { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetType: "all",
    classId: "",
    studentId: ""
  });

  const fetchData = async () => {
    try {
      if (user.role === "student" || user.role === "parent") {
        const noticesRes = await api.get("/notifications");
        setNotices(noticesRes.data);
      } else {
        const [noticesRes, classesRes, usersRes] = await Promise.all([
          api.get("/notifications"),
          api.get("/classes"),
          api.get("/users")
        ]);
        setNotices(noticesRes.data);
        setClasses(classesRes.data);
        setStudents(usersRes.data.filter(u => u.role === "student"));
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [user.role]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      message: form.message,
      audienceRole: form.targetType === "all" ? "all" : (form.targetType === "class" ? "student" : "student"),
      targetType: form.targetType,
      classId: form.targetType === "class" ? form.classId : null,
      studentId: form.targetType === "student" ? form.studentId : null
    };

    try {
      await api.post("/notifications", payload);
      setForm({ title: "", message: "", targetType: "all", classId: "", studentId: "" });
      setShowForm(false);
      fetchData();
      alert("Notice posted successfully!");
    } catch (err) {
      console.error("Failed to post notice", err);
      alert("Failed to post notice.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this notice?")) {
      try {
        await api.delete(`/notifications/${id}`);
        fetchData();
      } catch (err) {
        console.error("Failed to delete notice", err);
      }
    }
  };

  const visibleNotices = notices.filter(notice => {
    if (user.role === "admin" || user.role === "teacher") return true;
    
    // For students
    if (notice.targetType === "all") return true;
    if (notice.targetType === "class" && notice.classId === user.classId?._id) return true;
    if (notice.targetType === "student" && notice.studentId === user._id) return true;
    
    return false;
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Institute Notices"
        subtitle="Important announcements and targeted communications"
      />

      {(user.role === "admin" || user.role === "teacher") && (
        <div className="card max-w-2xl">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary mb-4"
          >
            {showForm ? "Cancel" : "Add New Notice"}
          </button>

          {showForm && (
            <form onSubmit={submit} className="space-y-4 border-t pt-4">
              <div>
                <label className="label">Title</label>
                <input 
                  className="input" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <label className="label">Message</label>
                <textarea 
                  className="input min-h-[100px]" 
                  value={form.message} 
                  onChange={e => setForm({...form, message: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Target Audience</label>
                  <select 
                    className="input"
                    value={form.targetType}
                    onChange={e => setForm({...form, targetType: e.target.value, classId: "", studentId: ""})}
                  >
                    <option value="all">General (Everyone)</option>
                    <option value="class">Specific Standard</option>
                    <option value="student">Personal (Single Student)</option>
                  </select>
                </div>

                {form.targetType === "class" && (
                  <div>
                    <label className="label">Select Standard</label>
                    <select 
                      className="input"
                      value={form.classId}
                      onChange={e => setForm({...form, classId: e.target.value})}
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.batchName}</option>
                      ))}
                    </select>
                  </div>
                )}

                {form.targetType === "student" && (
                  <div>
                    <label className="label">Select Student</label>
                    <select 
                      className="input"
                      value={form.studentId}
                      onChange={e => setForm({...form, studentId: e.target.value})}
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary w-full">Post Notice</button>
            </form>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleNotices.map((notice) => (
          <div key={notice._id} className="card relative group hover:shadow-lg transition">
            {(user.role === "admin" || user.role === "teacher") && (
              <button 
                onClick={() => handleDelete(notice._id)}
                className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
              >
                🗑️
              </button>
            )}
            
            <div className="flex items-center justify-between mb-2 pr-6">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {notice.title}
              </h2>
            </div>

            {notice.targetType && notice.targetType !== "all" && (
              <span className="inline-block mb-3 px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                {notice.targetType === "class" ? "Class Notice" : "Personal Notice"}
              </span>
            )}

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {notice.message}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                📅 {new Date(notice.createdAt).toLocaleDateString()}
              </span>
              {user.role === "admin" || user.role === "teacher" ? (
                <span className="text-[11px] font-bold text-slate-900">
                  By {notice.createdBy?.name || "Admin"}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}