import React, { useMemo } from "react";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import StatCard from "../components/StatCard";
import { demoMarks, demoUsers } from "../data/demo-data";

export default function MarksPage() {

  const students = demoUsers.filter((u) => u.role === "student");

  const avgMarks = useMemo(() => {
    if (!demoMarks.length) return 0;

    const total = demoMarks.reduce(
      (sum, item) => sum + (item.obtainedMarks / item.maxMarks) * 100,
      0
    );

    return Math.round(total / demoMarks.length);
  }, []);

  const topPerformers = useMemo(() => {
    return students
      .map((student) => {
        const studentMarks = demoMarks.filter(
          (m) => m.studentId._id === student._id
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
  }, []);

  return (
    <div className="space-y-6">

      <SectionHeader
        title="Test & Marks Management"
        subtitle="Track student academic performance and rankings"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Tests" value={demoMarks.length} />
        <StatCard title="Students Evaluated" value={students.length} />
        <StatCard title="Average Score %" value={avgMarks} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="card">

          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Top Performers
          </h2>

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

          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Recent Test Results
          </h2>

          <Table
            columns={[
              { key: "student", label: "Student", render: (row) => row.studentId?.name },
              { key: "subject", label: "Subject", render: (row) => row.subjectId?.subjectName },
              { key: "testType", label: "Test Type" },
              { key: "obtainedMarks", label: "Obtained" },
              { key: "maxMarks", label: "Max" },
              { key: "examDate", label: "Date" }
            ]}
            rows={demoMarks}
          />

        </div>

      </div>

    </div>
  );
}