import User from "../models/User.js";
import ClassModel from "../models/Class.js";
import Attendance from "../models/Attendance.js";
import Fee from "../models/Fee.js";
import Mark from "../models/Mark.js";
import { computeTrend } from "../utils/helpers.js";

export async function getAdminDashboard(req, res) {
  const [totalStudents, totalTeachers, classes, attendance, fees, marks] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    ClassModel.find(),
    Attendance.find(),
    Fee.find(),
    Mark.find()
  ]);

  const totalPresent = attendance.filter((item) => item.status === "present").length;
  const overallAttendance = attendance.length ? Number(((totalPresent / attendance.length) * 100).toFixed(2)) : 0;

  const pendingFees = fees.filter((f) => f.pendingAmount > 0);
  const classWiseDistribution = await Promise.all(
    classes.map(async (cls) => ({
      classId: cls._id,
      className: `${cls.standardName} ${cls.section}`,
      students: await User.countDocuments({ role: "student", classId: cls._id })
    }))
  );

  const weakStudents = await Promise.all(
    (await User.find({ role: "student" }).limit(50)).map(async (student) => {
      const studentMarks = await Mark.find({ studentId: student._id });
      if (!studentMarks.length) return null;
      const avg = studentMarks.reduce((sum, item) => sum + item.obtainedMarks, 0) / studentMarks.length;
      if (avg < 40) return { studentId: student._id, name: student.name, average: Number(avg.toFixed(2)) };
      return null;
    })
  );

  res.json({
    totalStudents,
    totalTeachers,
    classWiseDistribution,
    overallAttendance,
    pendingFeesCount: pendingFees.length,
    weakStudents: weakStudents.filter(Boolean)
  });
}

export async function getTeacherDashboard(req, res) {
  const classes = await ClassModel.find({ _id: { $in: req.user.teacherClassIds || [] } });
  const classIds = classes.map((c) => c._id);
  const attendance = await Attendance.find({ classId: { $in: classIds } });
  const marks = await Mark.find({ classId: { $in: classIds } }).populate("studentId", "name");

  const weakStudentsMap = new Map();
  for (const item of marks) {
    if (item.obtainedMarks < 40) {
      weakStudentsMap.set(String(item.studentId._id), { studentId: item.studentId._id, name: item.studentId.name, latestMark: item.obtainedMarks });
    }
  }

  res.json({
    assignedClasses: classes,
    attendanceRecords: attendance.length,
    weakStudents: Array.from(weakStudentsMap.values())
  });
}

export async function getStudentDashboard(req, res) {
  const studentId = req.user.role === "parent" ? req.user.linkedStudentId : req.user._id;
  const student = await User.findById(studentId);
  if (!student) return res.status(404).json({ message: "Student not found." });

  const [attendance, fees, marks, classInfo] = await Promise.all([
    Attendance.find({ studentId }),
    Fee.findOne({ studentId }).sort({ createdAt: -1 }),
    Mark.find({ studentId }).populate("subjectId", "subjectName").sort({ examDate: 1 }),
    ClassModel.findById(student.classId)
  ]);

  const present = attendance.filter((r) => r.status === "present").length;
  const attendancePercent = attendance.length ? Number(((present / attendance.length) * 100).toFixed(2)) : 0;
  const trend = marks.length ? computeTrend(marks.map((m) => m.obtainedMarks)) : "Stable";

  res.json({
    studentName: student.name,
    classInfo,
    attendancePercent,
    fees,
    marks,
    trend
  });
}
