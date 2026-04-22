import Notification from "../models/Notification.js";

export async function listNotifications(req, res) {
  const role = req.user.role;
  const classId = req.user.classId || req.query.classId || null;

  const query = {
    $or: [
      { audienceRole: "all" },
      { audienceRole: role },
      { studentId: req.user._id }
    ]
  };

  if (classId) {
    query.$or.push({ classId });
  }

  const rows = await Notification.find(query)
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

  res.json(rows);
}

export async function createNotification(req, res) {
  const notice = await Notification.create({
    ...req.body,
    createdBy: req.user._id
  });
  res.status(201).json(notice);
}
