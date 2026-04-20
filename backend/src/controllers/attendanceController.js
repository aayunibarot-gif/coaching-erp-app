import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

export async function markAttendance(req, res) {
  const { classId, date, absentStudentIds = [] } = req.body;

  const students = await User.find({ role: "student", classId });
  if (!students.length) {
    return res.status(400).json({ message: "No students found in this class." });
  }

  const ops = students.map((student) => {
    const status = absentStudentIds.includes(String(student._id)) ? "absent" : "present";
    return {
      updateOne: {
        filter: { studentId: student._id, date },
        update: {
          classId,
          studentId: student._id,
          date,
          status,
          markedBy: req.user._id
        },
        upsert: true
      }
    };
  });

  await Attendance.bulkWrite(ops);
  res.json({ message: "Attendance marked successfully." });
}

export async function getAttendanceSummary(req, res) {
  const { studentId, classId } = req.query;
  const filter = {};
  if (studentId) filter.studentId = studentId;
  if (classId) filter.classId = classId;

  const records = await Attendance.find(filter).populate("studentId", "name").sort({ date: 1 });
  if (!records.length) {
    return res.json({ percentage: 0, records: [] });
  }

  const presentCount = records.filter((r) => r.status === "present").length;
  const percentage = Number(((presentCount / records.length) * 100).toFixed(2));

  res.json({ percentage, records });
}
