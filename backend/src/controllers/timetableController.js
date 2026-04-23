import Timetable from "../models/Timetable.js";

export async function listTimetable(req, res) {
  try {
    const filter = req.query.classId ? { classId: req.query.classId } : {};
    const items = await Timetable.find(filter)
      .populate("classId", "standardName batch batchName")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error("List Timetable Error:", error);
    res.status(500).json({ message: "Failed to fetch timetable." });
  }
}

export async function createTimetable(req, res) {
  try {
    const item = await Timetable.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error("Create Timetable Error:", error);
    res.status(500).json({ message: "Failed to create timetable entry." });
  }
}

export async function updateTimetable(req, res) {
  try {
    const updated = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Timetable entry not found." });
    res.json(updated);
  } catch (error) {
    console.error("Update Timetable Error:", error);
    res.status(500).json({ message: "Failed to update timetable entry." });
  }
}

export async function deleteTimetableDay(req, res) {
  try {
    const deleted = await Timetable.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Timetable entry not found." });
    res.json({ message: "Deleted successfully." });
  } catch (error) {
    console.error("Delete Timetable Error:", error);
    res.status(500).json({ message: "Failed to delete timetable entry." });
  }
}
