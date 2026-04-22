import React, { useEffect, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function MaterialsPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    classId: "",
    file: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const classesRes = await api.get("/classes");
      setClasses(classesRes.data);

      let materialsRes;
      if (user.role === "student") {
        // Students only see materials for their specific class
        if (user.classId?._id) {
          materialsRes = await api.get(`/materials/class/${user.classId._id}`);
        } else {
          materialsRes = { data: [] };
        }
      } else {
        // Admins and Teachers see all materials (or we could filter by teacher)
        materialsRes = await api.get("/materials/all");
      }
      setMaterials(materialsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file || !form.classId || !form.title) {
      alert("Please fill all fields and select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("classId", form.classId);
    formData.append("pdf", form.file);

    try {
      setUploading(true);
      const res = await api.post("/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMaterials([res.data, ...materials]);
      setForm({ title: "", classId: "", file: null });
      // Reset file input
      e.target.reset();
      alert("Study material uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await api.delete(`/materials/${id}`);
      setMaterials(materials.filter((m) => m._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting material");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading materials...</div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Study Materials"
        subtitle={
          user.role === "student"
            ? "Access your learning resources and notes"
            : "Upload and manage PDF notes for students"
        }
      />

      {/* Teacher/Admin Upload Form */}
      {(user.role === "teacher" || user.role === "admin") && (
        <div className="card max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Upload New PDF</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Title</label>
                <input
                  className="input"
                  placeholder="e.g. Algebra Chapter 1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Target Standard</label>
                <select
                  className="input"
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  required
                >
                  <option value="">Select Standard</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.standardName} - {c.batch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">PDF File</label>
              <input
                type="file"
                accept=".pdf"
                className="input py-2"
                onChange={handleFileChange}
                required
              />
            </div>
            <button
              className="btn-primary w-full md:w-auto"
              type="submit"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Material"}
            </button>
          </form>
        </div>
      )}

      {/* Materials List */}
      <div className="card">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Available Resources</h3>
        {materials.length === 0 ? (
          <p className="text-slate-500 py-10 text-center">No study materials available yet.</p>
        ) : (
          <Table
            columns={[
              {
                key: "title",
                label: "Material Title",
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-bold text-slate-900">{row.title}</p>
                      <p className="text-xs text-slate-500">
                        Added {new Date(row.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "class",
                label: "Standard",
                render: (row) => (
                  <span className="badge badge-indigo">
                    {row.classId?.standardName || "General"}
                  </span>
                ),
              },
              {
                key: "teacher",
                label: "Teacher",
                render: (row) => row.teacherId?.name || "Unknown",
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="flex gap-2">
                    <a
                      href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${row.pdfPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-200"
                    >
                      View / Download
                    </a>
                    {(user.role === "admin" || row.teacherId?._id === user._id) && (
                      <button
                        onClick={() => handleDelete(row._id)}
                        className="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
            rows={materials}
          />
        )}
      </div>
    </div>
  );
}
