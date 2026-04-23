import mongoose from "mongoose";

const marksSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    testType: {
      type: String,
      default: "Unit Test"
    },
    obtainedMarks: {
      type: Number,
      required: true
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    examDate: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Mark", marksSchema);