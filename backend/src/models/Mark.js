import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    testType: { type: String, default: "Class Test" },
    maxMarks: { type: Number, default: 100 },
    obtainedMarks: { type: Number, required: true },
    examDate: { type: String, required: true },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const Mark = mongoose.model("Mark", markSchema);
export default Mark;
