import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    day: { type: String, required: true },
    standard: { type: String },
    batch: { type: String },
    batchName: { type: String },
    subject: { type: String, required: true },
    time: { type: String, required: true }
  },
  { timestamps: true }
);

const Timetable = mongoose.model("Timetable", timetableSchema);
export default Timetable;
