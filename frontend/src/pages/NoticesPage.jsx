import React, { useState, useMemo, useEffect } from "react";
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
  
  // States for searchable student dropdown
  const [studentSearch, setStudentSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [form, setForm] = useState({

    title: "",
    message: "",
    targetType: "all",
    classId: "",
    studentId: ""
  });

  // Filters and Pagination
  const [filterType, setFilterType] = useState("all_types"); // all_types, all (general), class, student
  const [filterClassId, setFilterClassId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;


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

  useEffect(() => {
    fetchData();
  }, [user.role]);

  const filteredStudentOptions = useMemo(() => {
    if (!studentSearch.trim()) return students;
    return students.filter(s => 
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
      (s.studentId || "").toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

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
      setStudentSearch("");
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

  const { filteredAndSortedNotices, totalPages } = useMemo(() => {
    // 1. First apply basic role-based access filtering
    let list = notices.filter(notice => {
      if (user.role === "admin" || user.role === "teacher") return true;
      if (!notice.targetType || notice.targetType === "all") return true;
      const noticeClassId = notice.classId?._id || notice.classId;
      const userClassId = user.classId?._id || user.classId;
      if (notice.targetType === "class" && String(noticeClassId) === String(userClassId)) return true;
      const noticeStudentId = notice.studentId?._id || notice.studentId;
      if (notice.targetType === "student" && String(noticeStudentId) === String(user._id)) return true;
      return false;
    });

    // 2. Apply User Filters (Type, Class, Date)
    if (filterType !== "all_types") {
      list = list.filter(n => n.targetType === filterType);
    }
    if (filterClassId) {
      list = list.filter(n => (n.classId?._id || n.classId) === filterClassId);
    }
    if (filterDate) {
      const searchDate = new Date(filterDate).toDateString();
      list = list.filter(n => new Date(n.createdAt).toDateString() === searchDate);
    }

    // 3. Sort by Newest First
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = Math.ceil(list.length / itemsPerPage);
    
    // 4. Paginate
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = list.slice(start, start + itemsPerPage);

    return { filteredAndSortedNotices: paginated, totalPages: total };
  }, [notices, user, filterType, filterClassId, filterDate, currentPage]);


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
                  <div className="relative">
                    <label className="label">Select Student</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input pr-10"
                        placeholder="Search student by name or ID..."
                        value={studentSearch}
                        onChange={(e) => {
                          setStudentSearch(e.target.value);
                          setDropdownOpen(true);
                        }}
                        onFocus={() => setDropdownOpen(true)}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        🔍
                      </div>
                    </div>

                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                        {filteredStudentOptions.length > 0 ? (
                          filteredStudentOptions.map((s) => (
                            <button
                              key={s._id}
                              type="button"
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0 ${
                                form.studentId === s._id ? "bg-indigo-50 font-bold text-indigo-600" : "text-slate-700"
                              }`}
                              onClick={() => {
                                setForm({ ...form, studentId: s._id });
                                setStudentSearch(`${s.name} (${s.studentId})`);
                                setDropdownOpen(false);
                              }}
                            >
                              <div className="font-bold">{s.name}</div>
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.studentId} • {s.classId?.batchName || "No Class"}</div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500 italic">
                            No students found matching "{studentSearch}"
                          </div>
                        )}
                      </div>
                    )}
                    {/* Click outside to close - invisible overlay */}
                    {dropdownOpen && (
                      <div 
                        className="fixed inset-0 z-0" 
                        onClick={() => setDropdownOpen(false)}
                      />
                    )}
                  </div>
                )}

              </div>

              <button type="submit" className="btn-primary w-full">Post Notice</button>
            </form>
          )}
        </div>
      )}

      {/* Filters Section */}
      <div className="card flex flex-wrap gap-4 items-end">
        <div>
          <label className="label text-[10px] uppercase tracking-wider text-slate-400">Filter by Type</label>
          <select 
            className="input py-2 text-xs" 
            value={filterType} 
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
          >
            <option value="all_types">All Types</option>
            <option value="all">General Notices</option>
            <option value="class">Standard Wise</option>
            <option value="student">Personal Notices</option>
          </select>
        </div>

        {filterType === "class" && (
          <div>
            <label className="label text-[10px] uppercase tracking-wider text-slate-400">Select Standard</label>
            <select 
              className="input py-2 text-xs" 
              value={filterClassId} 
              onChange={(e) => { setFilterClassId(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Standards</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.batchName}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label text-[10px] uppercase tracking-wider text-slate-400">Filter by Date</label>
          <input 
            type="date" 
            className="input py-2 text-xs" 
            value={filterDate} 
            onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <button 
          className="text-xs font-bold text-red-500 hover:underline pb-3 ml-auto"
          onClick={() => {
            setFilterType("all_types");
            setFilterClassId("");
            setFilterDate("");
            setCurrentPage(1);
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Notices Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAndSortedNotices.length > 0 ? (
          filteredAndSortedNotices.map((notice) => (
            <div key={notice._id} className="card relative group hover:shadow-lg transition flex flex-col h-full">
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
                <span className="inline-block mb-3 px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase tracking-wider w-fit">
                  {notice.targetType === "class" ? "Class Notice" : "Personal Notice"}
                </span>
              )}

              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap flex-1">
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
          ))
        ) : (
          <div className="col-span-full py-20 text-center card bg-slate-50 border-dashed border-2">
            <p className="text-slate-500 italic">No notices found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 no-print">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-secondary px-6 disabled:opacity-50"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-10 w-10 rounded-xl font-bold transition-all ${
                  currentPage === i + 1 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                  : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-secondary px-6 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}