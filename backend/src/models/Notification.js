import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetType: { type: String, enum: ["all", "class", "student"], default: "all" },
    audienceRole: { type: String, enum: ["admin", "teacher", "student", "parent", "all"], default: "all" },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
