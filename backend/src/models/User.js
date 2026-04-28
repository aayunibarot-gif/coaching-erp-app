import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "student", "parent"],
      default: "student",
    },

    phone: {
      type: String,
      default: "",
    },

    studentId: {
      type: String,
      default: "",
    },

    parentName: {
      type: String,
      default: "",
    },

    parentPhone: {
      type: String,
      default: "",
    },

    linkedStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },

    isApproved: {
      type: Boolean,
      default: function() {
        return this.role !== "student";
      }
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);