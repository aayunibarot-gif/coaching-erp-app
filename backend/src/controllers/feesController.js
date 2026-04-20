import Fee from "../models/Fee.js";

export async function listFees(req, res) {
  const filter = {};
  if (req.query.studentId) filter.studentId = req.query.studentId;
  if (req.query.classId) filter.classId = req.query.classId;

  const fees = await Fee.find(filter)
    .populate("studentId", "name email")
    .populate("classId", "standardName section");
  res.json(fees);
}

export async function createFee(req, res) {
  const fee = await Fee.create(req.body);
  res.status(201).json(fee);
}

export async function updateFee(req, res) {
  const fee = await Fee.findById(req.params.id);
  if (!fee) return res.status(404).json({ message: "Fee record not found." });

  Object.assign(fee, req.body);

  const pendingAmount = Math.max(0, Number(fee.totalAmount) - Number(fee.paidAmount));
  fee.pendingAmount = pendingAmount;
  fee.status = pendingAmount === 0 ? "paid" : fee.paidAmount > 0 ? "partial" : "unpaid";

  await fee.save();
  res.json(fee);
}
