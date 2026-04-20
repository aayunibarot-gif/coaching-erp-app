import Timetable from "../models/Timetable.js";
import ClassModel from "../models/Class.js";

export async function listTimetable(req, res) {
  if (!req.query.classId) {
    return res.status(400).json({ message: "classId is required." });
  }

  const classObj = await ClassModel.findById(req.query.classId);
  const items = await Timetable.find({ classId: req.query.classId }).populate("periods.subjectId", "subjectName");
  res.json({
    classInfo: classObj,
    schedule: items
  });
}

export async function upsertTimetable(req, res) {
  const { classId, day, periods } = req.body;
  const item = await Timetable.findOneAndUpdate(
    { classId, day },
    { classId, day, periods },
    { upsert: true, new: true }
  );
  res.json(item);
}

export async function deleteTimetableDay(req, res) {
  const deleted = await Timetable.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Timetable row not found." });
  res.json({ message: "Deleted successfully." });
}
