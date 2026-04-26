import mongoose from "mongoose";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Mark from "../models/Mark.js";
import Fee from "../models/Fee.js";
import Remark from "../models/Remark.js";
import bcrypt from "bcryptjs";
import { sendApprovalSuccessEmailToStudent } from "../utils/email.js";
import { validateObjectId } from "../utils/validation.js";

// Controller to manage user records
export const getUsers = async (req, res) => {
  const users = await User.find()
    .populate("classId", "standardName batch batchName timingStart timingEnd")
    .sort({ createdAt: -1 });

  res.json(users);
};

export const createUser = async (req, res) => {
  const { name, email, password, role, phone, classId, studentId, parentName, parentPhone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone,
    studentId,
    parentName,
    parentPhone,
    classId: role === "student" ? validateObjectId(classId) : null,
    isApproved: true,
  });

  const populated = await User.findById(user._id).populate(
    "classId",
    "standardName batch batchName timingStart timingEnd"
  );

  res.status(201).json(populated);
};

export const updateUser = async (req, res) => {
  const { name, email, password, role, phone, classId, studentId, parentName, parentPhone } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Protection: Teachers can only modify students
  if (req.user.role === "teacher" && user.role !== "student") {
    return res.status(403).json({ message: "Teachers can only manage student records" });
  }


  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.role = role ?? user.role;
  user.phone = phone ?? user.phone;
  user.studentId = studentId ?? user.studentId;
  user.parentName = parentName ?? user.parentName;
  user.parentPhone = parentPhone ?? user.parentPhone;
  user.classId = role === "student" ? validateObjectId(classId) : null;

  if (password && password.trim()) {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();

  const populated = await User.findById(user._id).populate(
    "classId",
    "standardName batch batchName timingStart timingEnd"
  );

  res.json(populated);
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (req.user && req.user._id.toString() === user._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  // Protection: Teachers can only delete students
  if (req.user.role === "teacher" && user.role !== "student") {
    return res.status(403).json({ message: "Teachers can only delete student records" });
  }


  await user.deleteOne();
  res.json({ message: "User deleted successfully" });
};

export const getStudentDetails = async (req, res) => {
  const student = await User.findById(req.params.id).populate(
    "classId",
    "standardName batch batchName timingStart timingEnd"
  );

  if (!student || student.role !== "student") {
    return res.status(404).json({ message: "Student not found" });
  }

  const attendance = await Attendance.find({ studentId: student._id })
    .sort({ date: -1 })
    .lean();

  const marks = await Mark.find({ studentId: student._id })
    .populate("subjectId", "subjectName")
    .sort({ examDate: -1 })
    .lean();

  const fees = await Fee.find({ studentId: student._id })
    .sort({ createdAt: -1 })
    .lean();

  const remarks = await Remark.find({ studentId: student._id })
    .sort({ createdAt: -1 })
    .lean();

  const totalAttendance = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const attendancePercent = totalAttendance
    ? Math.round((presentCount / totalAttendance) * 100)
    : 0;

  const avgMarks = marks.length
    ? Math.round(
        marks.reduce((sum, item) => {
          return sum + ((item.obtainedMarks / item.maxMarks) * 100 || 0);
        }, 0) / marks.length
      )
    : 0;

  const pendingFees = fees.reduce((sum, item) => sum + (item.pendingAmount || 0), 0);

  res.json({
    student,
    attendance,
    marks,
    fees,
    remarks,
    summary: {
      attendancePercent,
      avgMarks,
      pendingFees,
      remarksCount: remarks.length,
    },
  });
};

export const getPendingUsers = async (req, res) => {
  const users = await User.find({ isApproved: false })
    .populate("classId", "standardName batch batchName timingStart timingEnd")
    .sort({ createdAt: -1 });

  res.json(users);
};

export const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isApproved = true;
  await user.save();

  // Send success email to student
  await sendApprovalSuccessEmailToStudent(user.name, user.email);

  res.json({ message: "User approved successfully" });
};

export const approveDirect = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
          <h1 style="color: #ef4444;">User Not Found</h1>
          <p>The student record could not be found. They may have already been deleted.</p>
        </div>
      `);
    }

    if (user.isApproved) {
      return res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
          <h1 style="color: #10b981;">Already Approved</h1>
          <p>Student <strong>${user.name}</strong> is already approved and active.</p>
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="color: #6366f1;">Go to Dashboard</a>
        </div>
      `);
    }

    user.isApproved = true;
    await user.save();

    // Send success email to student
    await sendApprovalSuccessEmailToStudent(user.name, user.email);

    res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
        <h1 style="color: #10b981;">Approval Successful!</h1>
        <p>Student <strong>${user.name}</strong> has been approved and notified via email.</p>
        <p style="color: #64748b;">You can now close this tab.</p>
        <br />
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" 
           style="background-color: #6366f1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Go to Dashboard
        </a>
      </div>
    `);
  } catch (error) {
    console.error("Direct approval error:", error);
    res.status(500).send("An error occurred during approval.");
  }
};