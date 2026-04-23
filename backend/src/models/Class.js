import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    standardName: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: String,
      default: "Morning",
    },
    batchName: {
      type: String,
      default: "",
    },
    timingStart: {
      type: String,
      default: "",
    },
    timingEnd: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);