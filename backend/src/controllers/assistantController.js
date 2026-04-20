import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Mark from "../models/Mark.js";
import Fee from "../models/Fee.js";
import Timetable from "../models/Timetable.js";
import ClassModel from "../models/Class.js";
import { computeAttendanceStatus, computeMarksLevel, computeTrend } from "../utils/helpers.js";

export async function instituteAssistant(req, res) {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ message: "query is required." });
  }

  const lowered = query.toLowerCase();
  const role = req.user.role;
  const studentId = role === "parent" ? req.user.linkedStudentId : req.user._id;

  if (lowered === "hi" || lowered === "hello") {
    return res.json({
      title: "Welcome to Coaching Institute ERP System",
      options: ["Attendance", "Marks", "Fees", "Timetable", "Performance"]
    });
  }

  if ((role === "student" || role === "parent") && lowered.includes("attendance")) {
    const records = await Attendance.find({ studentId });
    if (!records.length) {
      return res.json({ message: "I don't have enough data to answer that." });
    }
    const present = records.filter((r) => r.status === "present").length;
    const percentage = Number(((present / records.length) * 100).toFixed(2));
    const student = await User.findById(studentId).populate("classId");
    return res.json({
      heading: "Attendance Report",
      class: `${student.classId.standardName} ${student.classId.section}`,
      attendance: `${percentage}%`,
      insight: computeAttendanceStatus(percentage),
      suggestion: percentage < 75 ? "Attend classes regularly and avoid missing timetable slots." : "Keep maintaining your consistency."
    });
  }

  if ((role === "student" || role === "parent") && lowered.includes("marks")) {
    const student = await User.findById(studentId).populate("classId");
    const marks = await Mark.find({ studentId }).populate("subjectId", "subjectName");
    if (!marks.length) {
      return res.json({ message: "I don't have enough data to answer that." });
    }
    const subjectLines = marks.map((m) => ({
      subject: m.subjectId?.subjectName || "Unknown",
      score: `${m.obtainedMarks}/${m.maxMarks}`,
      remark: computeMarksLevel(m.obtainedMarks)
    }));
    const weak = subjectLines.filter((s) => s.remark === "Weak").map((s) => s.subject);
    const strong = subjectLines.filter((s) => s.remark === "Good").map((s) => s.subject);

    return res.json({
      heading: "Academic Performance",
      class: `${student.classId.standardName} ${student.classId.section}`,
      subjects: subjectLines,
      analysis: {
        weakSubjects: weak,
        strongSubjects: strong
      },
      suggestions: weak.length ? weak.map((s) => `Improve ${s} with weekly revision and test practice.`) : ["You are doing well across your subjects."]
    });
  }

  if ((role === "student" || role === "parent") && lowered.includes("fees")) {
    const fee = await Fee.findOne({ studentId }).sort({ createdAt: -1 });
    if (!fee) {
      return res.json({ message: "I don't have enough data to answer that." });
    }
    return res.json({
      heading: "Fees Status",
      status: fee.status,
      pendingAmount: fee.pendingAmount,
      reminder: fee.pendingAmount > 0 ? "Please pay pending fees before due date." : "All fees are clear."
    });
  }

  if ((role === "student" || role === "parent") && lowered.includes("timetable")) {
    const student = await User.findById(studentId);
    const classInfo = await ClassModel.findById(student.classId);
    const rows = await Timetable.find({ classId: student.classId }).populate("periods.subjectId", "subjectName");
    if (!rows.length || !classInfo) {
      return res.json({ message: "I don't have enough data to answer that." });
    }
    return res.json({
      heading: "Class Timetable",
      class: `${classInfo.standardName} ${classInfo.section}`,
      timing: `${classInfo.timingStart} to ${classInfo.timingEnd}`,
      schedule: rows.map((row) => ({
        day: row.day,
        periods: row.periods.map((p) => ({
          subject: p.subjectId?.subjectName || "Unknown",
          startTime: p.startTime,
          endTime: p.endTime
        }))
      }))
    });
  }

  if ((role === "student" || role === "parent") && lowered.includes("performance")) {
    const marks = await Mark.find({ studentId }).populate("subjectId", "subjectName").sort({ examDate: 1 });
    if (!marks.length) {
      return res.json({ message: "I don't have enough data to answer that." });
    }
    const overallTrend = computeTrend(marks.map((m) => m.obtainedMarks));
    const weakAreas = marks.filter((m) => m.obtainedMarks < 40).map((m) => m.subjectId?.subjectName || "Unknown");
    const strengths = marks.filter((m) => m.obtainedMarks > 70).map((m) => m.subjectId?.subjectName || "Unknown");
    return res.json({
      heading: "Performance Summary",
      trend: overallTrend,
      strengths: [...new Set(strengths)],
      weakAreas: [...new Set(weakAreas)],
      improvementPlan: weakAreas.length
        ? ["Revise weak topics weekly.", "Solve extra practice questions.", "Attend teacher doubt sessions."]
        : ["Continue your current study routine."]
    });
  }

  return res.json({
    message: "I don't have enough data to answer that."
  });
}
