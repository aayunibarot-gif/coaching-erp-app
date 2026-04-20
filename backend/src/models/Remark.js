import mongoose from "mongoose";

const remarkSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

const Remark = mongoose.model("Remark", remarkSchema);
export default Remark;
