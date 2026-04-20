import Mark from "../models/Mark.js";
import Subject from "../models/Subject.js";
import { computeMarksLevel, computeTrend } from "../utils/helpers.js";

export async function addMarks(req, res) {
  const { entries = [] } = req.body;
  if (!entries.length) {
    return res.status(400).json({ message: "entries array is required." });
  }

  const prepared = entries.map((item) => ({
    ...item,
    enteredBy: req.user._id
  }));

  const created = await Mark.insertMany(prepared);
  res.status(201).json(created);
}

export async function getMarks(req, res) {
  const filter = {};
  if (req.query.studentId) filter.studentId = req.query.studentId;
  if (req.query.classId) filter.classId = req.query.classId;

  const marks = await Mark.find(filter)
    .populate("subjectId", "subjectName")
    .populate("studentId", "name")
    .sort({ examDate: 1 });

  res.json(marks);
}

export async function getPerformance(req, res) {
  const { studentId } = req.query;
  if (!studentId) {
    return res.status(400).json({ message: "studentId is required." });
  }

  const marks = await Mark.find({ studentId }).populate("subjectId", "subjectName").sort({ examDate: 1 });
  if (!marks.length) {
    return res.json({ message: "I don't have enough data to answer that." });
  }

  const subjectsMap = new Map();

  for (const item of marks) {
    const name = item.subjectId?.subjectName || "Unknown";
    if (!subjectsMap.has(name)) subjectsMap.set(name, []);
    subjectsMap.get(name).push(item.obtainedMarks);
  }

  const subjectSummary = Array.from(subjectsMap.entries()).map(([subjectName, scores]) => ({
    subjectName,
    latestScore: scores[scores.length - 1],
    level: computeMarksLevel(scores[scores.length - 1]),
    trend: computeTrend(scores)
  }));

  const strongSubjects = subjectSummary.filter((s) => s.latestScore > 70).map((s) => s.subjectName);
  const weakSubjects = subjectSummary.filter((s) => s.latestScore < 40).map((s) => s.subjectName);
  const overallTrend = computeTrend(marks.map((m) => m.obtainedMarks));

  res.json({
    trend: overallTrend,
    strengths: strongSubjects,
    weakAreas: weakSubjects,
    subjects: subjectSummary
  });
}
