import Subject from "../models/Subject.js";

export async function listSubjects(req, res) {
  const filter = req.query.classId ? { classId: req.query.classId } : {};
  const subjects = await Subject.find(filter)
    .populate("classId", "standardName batchName")
    .populate("teacherId", "name");
  res.json(subjects);
}

export async function createSubject(req, res) {
  const subject = await Subject.create(req.body);
  res.status(201).json(subject);
}

export async function updateSubject(req, res) {
  const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Subject not found." });
  res.json(updated);
}

export async function deleteSubject(req, res) {
  const deleted = await Subject.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Subject not found." });
  res.json({ message: "Subject deleted successfully." });
}
