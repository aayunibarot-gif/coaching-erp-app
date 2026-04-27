import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SectionHeader from "../components/SectionHeader";
import Loader from "../components/Loader";

export default function ResultPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const printRef = useRef();

  const fetchStudents = async () => {
    if (user.role === "admin" || user.role === "teacher") {
      try {
        const res = await api.get("/users");
        setStudents(res.data.filter((u) => u.role === "student"));
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    }
  };

  const fetchResult = async (id) => {
    setLoading(true);
    try {
      const targetId = id || user._id;
      const res = await api.get(`/results/${targetId}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch result", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    if (user.role === "student") {
      fetchResult(user._id);
    } else {
      setLoading(false);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading && !data) return <Loader text="Generating report card..." />;

  return (
    <div className="space-y-6 pb-20">
      <SectionHeader 
        title="Student Report Card" 
        subtitle="Consolidated academic performance and result summary" 
      />

      {/* Admin/Teacher Selector */}
      {(user.role === "admin" || user.role === "teacher") && (
        <div className="card no-print">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="label">Select Student to View Result</label>
              <select 
                className="input"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Select a student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.studentId} - {s.name}</option>
                ))}
              </select>
            </div>
            <button 
              className="btn-primary"
              onClick={() => fetchResult(selectedStudentId)}
              disabled={!selectedStudentId}
            >
              Generate Result
            </button>
          </div>
        </div>
      )}

      {data ? (
        <div className="space-y-8">
          <div className="no-print flex justify-end">
            <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
              <span>🖨️</span> Print Report Card
            </button>
          </div>

          {data.results.length > 0 ? (
            data.results.map((report, idx) => (
              <div 
                key={idx} 
                className="bg-white border-4 border-double border-slate-300 p-8 shadow-xl max-w-4xl mx-auto print:shadow-none print:border-slate-800"
                id={`report-card-${idx}`}
              >
                {/* School Header */}
                <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
                  <img src="/logo.jpg" alt="Eduverse Coaching" className="h-24 mx-auto mb-4" />


                  <div className="inline-block mt-4 px-6 py-1 bg-slate-900 text-white rounded-full text-sm font-bold uppercase tracking-widest">
                    Academic Progress Report
                  </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-y-4 text-sm mb-8 px-4">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-500 w-32">Student Name:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1">{data.student.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-500 w-32">Roll No:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1">{data.student.studentId}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-500 w-32">Standard:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1">{data.student.standard}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-500 w-32">Exam Type:</span>
                    <span className="font-black text-slate-900 border-b border-dotted border-slate-400 flex-1">{report.testType}</span>
                  </div>
                </div>

                {/* Marks Table */}
                <table className="w-full border-collapse border border-slate-800 mb-8">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-800 p-3 text-left">Subject Name</th>
                      <th className="border border-slate-800 p-3 text-center w-32">Max Marks</th>
                      <th className="border border-slate-800 p-3 text-center w-32">Obtained</th>
                      <th className="border border-slate-800 p-3 text-center w-32">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.subjects.map((sub, sIdx) => (
                      <tr key={sIdx}>
                        <td className="border border-slate-800 p-3 font-semibold">{sub.subjectName}</td>
                        <td className="border border-slate-800 p-3 text-center">{sub.max}</td>
                        <td className="border border-slate-800 p-3 text-center font-bold">{sub.obtained}</td>
                        <td className="border border-slate-800 p-3 text-center text-xs">
                          {sub.obtained / sub.max >= 0.75 ? "Distinction" : sub.obtained / sub.max >= 0.4 ? "Satisfactory" : "Needs Improvement"}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-black">
                      <td className="border border-slate-800 p-3 text-right">GRAND TOTAL</td>
                      <td className="border border-slate-800 p-3 text-center">{report.totalMax}</td>
                      <td className="border border-slate-800 p-3 text-center text-indigo-600">{report.totalObtained}</td>
                      <td className="border border-slate-800 p-3"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Summary Footer */}
                <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest opacity-70">Percentage</p>
                    <p className="text-3xl font-black">{report.percentage}%</p>
                  </div>
                  <div className="h-12 w-px bg-white/20"></div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest opacity-70">Result Status</p>
                    <p className={`text-3xl font-black ${report.status === "Pass" ? "text-emerald-400" : "text-red-400"}`}>
                      {report.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="h-12 w-px bg-white/20"></div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest opacity-70">Grade</p>
                    <p className="text-3xl font-black">
                      {report.percentage >= 90 ? "A+" : report.percentage >= 75 ? "A" : report.percentage >= 60 ? "B" : report.percentage >= 40 ? "C" : "D"}
                    </p>
                  </div>
                </div>

                {/* Signature Area */}
                <div className="mt-12 flex justify-between px-10">
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-800 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Class Teacher</p>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-800 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Principal Signature</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center p-12">
              <p className="text-slate-500 italic">No marks have been recorded for this student yet. Report card cannot be generated.</p>
            </div>
          )}
        </div>
      ) : (
        selectedStudentId && !loading && (
          <div className="card text-center p-12 text-slate-500">
            Select a student and click "Generate Result"
          </div>
        )
      )}

      {/* Styles for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .no-print { display: none !important; }
          #report-card-0 { 
            visibility: visible; 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0;
            padding: 2rem;
          }
          #report-card-0 * { visibility: visible; }
        }
      `}} />
    </div>
  );
}
