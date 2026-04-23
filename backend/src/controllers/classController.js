import ClassModel from "../models/Class.js";

export async function listClasses(req, res) {
  try {
    const classes = await ClassModel.find().lean();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch classes" });
  }
}

export async function createClass(req, res) {
  try {
    const created = await ClassModel.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Standard "${req.body.standardName}" already exists.` });
    }
    throw error;
  }
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
