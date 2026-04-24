import Notification from "../models/Notification.js";

export async function listNotifications(req, res) {
  const { role, _id, classId } = req.user;

  if (role === "admin" || role === "teacher") {
    // Admins and teachers see everything
    const rows = await Notification.find({})
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    return res.json(rows);
  }

  // For students
  const query = {
    $or: [
      { audienceRole: "all" },
      { targetType: "all", audienceRole: "student" },
      { targetType: "class", classId: classId },
      { targetType: "student", studentId: _id }
    ]
  };

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
