import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    day: { type: String, required: true },
    periods: [
      {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

const Timetable = mongoose.model("Timetable", timetableSchema);
export default Timetable;
