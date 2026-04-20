import Remark from "../models/Remark.js";

export async function listRemarks(req, res) {
  const filter = {};
  if (req.query.studentId) filter.studentId = req.query.studentId;
  if (req.query.classId) filter.classId = req.query.classId;

  const remarks = await Remark.find(filter)
    .populate("studentId", "name")
    .populate("teacherId", "name")
    .sort({ createdAt: -1 });
  res.json(remarks);
}

export async function createRemark(req, res) {
  const data = {
    ...req.body,
    teacherId: req.user._id
  };
  const remark = await Remark.create(data);
  res.status(201).json(remark);
}
