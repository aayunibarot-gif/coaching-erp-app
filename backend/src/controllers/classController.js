import ClassModel from "../models/Class.js";

export async function listClasses(req, res) {
  const classes = await ClassModel.find().populate("classTeacherId", "name email");
  res.json(classes);
}

export async function createClass(req, res) {
  const created = await ClassModel.create(req.body);
  res.status(201).json(created);
}

export async function updateClass(req, res) {
  const updated = await ClassModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Class not found." });
  res.json(updated);
}

export async function deleteClass(req, res) {
  const deleted = await ClassModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Class not found." });
  res.json({ message: "Class deleted successfully." });
}
