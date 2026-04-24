import Fee from "../models/Fee.js";
import { validateObjectId } from "../utils/validation.js";

export async function listFees(req, res) {
  try {
    const filter = {};
    if (req.query.studentId) {
      const validStudentId = validateObjectId(req.query.studentId);
      if (validStudentId) filter.studentId = validStudentId;
    }
    if (req.query.classId) {
      const validClassId = validateObjectId(req.query.classId);
      if (validClassId) filter.classId = validClassId;
    }

    const fees = await Fee.find(filter)
      .populate("studentId", "name studentId parentName parentPhone email")
      .populate("classId", "standardName batchName");
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createFee(req, res) {
  try {
    const data = { ...req.body };
    
    const classId = validateObjectId(data.classId);
    const studentId = validateObjectId(data.studentId);

    if (!classId) return res.status(400).json({ message: "Valid Class ID is required." });
    if (!studentId) return res.status(400).json({ message: "Valid Student ID is required." });

    data.classId = classId;
    data.studentId = studentId;
    
    // Auto-calculate pending and status
    const totalAmount = Number(data.totalAmount || 0);
    const paidAmount = Number(data.paidAmount || 0);
    data.pendingAmount = Math.max(0, totalAmount - paidAmount);
    data.status = data.pendingAmount === 0 ? "paid" : paidAmount > 0 ? "partial" : "unpaid";

    const fee = await Fee.create(data);
    
    // Populate for immediate feedback if needed, though list call usually follows
    const populated = await Fee.findById(fee._id)
      .populate("studentId", "name studentId parentName parentPhone email")
      .populate("classId", "standardName batchName");

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateFee(req, res) {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found." });

    const data = { ...req.body };
    if (data.classId) data.classId = validateObjectId(data.classId) || fee.classId;
    if (data.studentId) data.studentId = validateObjectId(data.studentId) || fee.studentId;

    Object.assign(fee, data);

    const pendingAmount = Math.max(0, Number(fee.totalAmount) - Number(fee.paidAmount));
    fee.pendingAmount = pendingAmount;
    fee.status = pendingAmount === 0 ? "paid" : fee.paidAmount > 0 ? "partial" : "unpaid";

    await fee.save();
    
    const populated = await Fee.findById(fee._id)
      .populate("studentId", "name studentId parentName parentPhone email")
      .populate("classId", "standardName batchName");

    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

