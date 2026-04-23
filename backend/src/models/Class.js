import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    standardName: {
      type: String,
      required: true,
      trim: true,
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