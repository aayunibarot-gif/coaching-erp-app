import React, { useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { demoAttendanceRecords, demoClasses, demoUsers } from "../data/demoData";
import { useAuth } from "../context/AuthContext";

export default function AttendancePage() {
  const { user } = useAuth();

  const [selectedStandard, setSelectedStandard] = useState("6th Standard");
  const [selectedBatch, setSelectedBatch] = useState("Morning");
  const [selectedDate, setSelectedDate] = useState("2026-04-18");
  const [attendanceMap, setAttendanceMap] = useState({});

  const students = demoUsers.filter((u) => u.role === "student");

  const standardOptions = [...new Set(demoClasses.map((item) => item.standardName))];

  const batchOptions = demoClasses
    .filter((item) => item.standardName === selectedStandard)
    .map((item) => item.batch);

  const selectedClassData = demoClasses.find(
    (item) => item.standardName === selectedStandard && item.batch === selectedBatch
  );

  const classStudents = useMemo(() => {
    if (!selectedClassData) return [];
    return students.filter((student) => student.classId?._id === selectedClassData._id);
  }, [students, selectedClassData]);

  const classAttendanceHistory = useMemo(() => {
    if (!selectedClassData) return [];
    return demoAttendanceRecords.filter((item) => item.classId === selectedClassData._id);
  }, [selectedClassData]);

  const presentCount = classAttendanceHistory.filter((a) => a.status === "present").length;
  const absentCount = classAttendanceHistory.filter((a) => a.status === "absent").length;
  const attendancePercent = classAttendanceHistory.length
    ? Math.round((presentCount / classAttendanceHistory.length) * 100)
    : 0;

  const todaySummary = useMemo(() => {
    const presentToday = Object.values(attendanceMap).filter((value) => value === "present").length;
    const absentToday = Object.values(attendanceMap).filter((value) => value === "absent").length;

    return {
      presentToday,
      absentToday
    };
  }, [attendanceMap]);

  const setStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const teacherView = (
    <div className="space-y-6">
      <SectionHeader
        title="Class-wise Attendance"
        subtitle="Teacher can select standard and batch, then manually mark attendance"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Selected Standard" value={selectedStandard || "-"} />
        <StatCard title="Selected Batch" value={selectedBatch || "-"} />
        <StatCard title="Students in Batch" value={classStudents.length} />
        <StatCard title="Attendance %" value={attendancePercent} />
      </div>

      <div className="card grid gap-4 md:grid-cols-4">
        <div>
          <label className="label">Select Standard</label>
          <select
            className="input"
            value={selectedStandard}
            onChange={(e) => {
              const newStandard = e.target.value;
              setSelectedStandard(newStandard);
              const firstBatch =
                demoClasses.find((item) => item.standardName === newStandard)?.batch || "";
              setSelectedBatch(firstBatch);
              setAttendanceMap({});
            }}
          >
            {standardOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Select Batch</label>
          <select
            className="input"
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setAttendanceMap({});
            }}
          >
            {batchOptions.map((item) => (
              <option key={item} value={item}>
                {item} Batch
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Attendance Date</label>
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button className="btn-primary w-full">
            Save Attendance
          </button>
        </div>
      </div>

      <div className="card">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Mark Attendance</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select present or absent for each student in the chosen batch
          </p>
        </div>

        <div className="space-y-3">
          {classStudents.length ? (
            classStudents.map((student) => (
              <div
                key={student._id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {student.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {student.studentId} • Parent: {student.parentName} • {student.parentPhone}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(student._id, "present")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      attendanceMap[student._id] === "present"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    }`}
                  >
                    Present
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus(student._id, "absent")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      attendanceMap[student._id] === "absent"
                        ? "bg-red-600 text-white"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
              No students found in this batch.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Today Present Marked" value={todaySummary.presentToday} />
        <StatCard title="Today Absent Marked" value={todaySummary.absentToday} />
      </div>

      <div className="card">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Attendance History</h2>
          <p className="mt-1 text-sm text-slate-500">
            Previous attendance records for selected standard and batch
          </p>
        </div>

        <Table
          columns={[
            {
              key: "studentId",
              label: "Student ID",
              render: (row) => row.studentId?.studentId || "-"
            },
            {
              key: "student",
              label: "Student Name",
              render: (row) => row.studentId?.name || "-"
            },
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
                )
            }
          ]}
          rows={classAttendanceHistory}
        />
      </div>
    </div>
  );

  const studentRecords = demoAttendanceRecords.filter((item) => item.studentId._id === user?._id);
  const studentPresentCount = studentRecords.filter((a) => a.status === "present").length;
  const studentPercent = studentRecords.length
    ? Math.round((studentPresentCount / studentRecords.length) * 100)
    : 0;

  const studentView = (
    <div className="space-y-6">
      <SectionHeader
        title="Attendance"
        subtitle="View your attendance records"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Attendance %" value={studentPercent} />
        <StatCard title="Present" value={studentPresentCount} />
        <StatCard title="Records" value={studentRecords.length} />
      </div>

      <div className="card">
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
                )
            }
          ]}
          rows={studentRecords}
        />
      </div>
    </div>
  );

  return user?.role === "teacher" || user?.role === "admin" ? teacherView : studentView;
}