import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import ClassModel from "./models/Class.js";
import Subject from "./models/Subject.js";
import Attendance from "./models/Attendance.js";
import Mark from "./models/Mark.js";
import Fee from "./models/Fee.js";
import Remark from "./models/Remark.js";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  await User.deleteMany();
  await ClassModel.deleteMany();
  await Subject.deleteMany();
  await Attendance.deleteMany();
  await Mark.deleteMany();
  await Fee.deleteMany();
  await Remark.deleteMany();

  const passwords = {
    admin: await bcrypt.hash("admin123", 10),
    teacher: await bcrypt.hash("teacher123", 10),
    student: await bcrypt.hash("student123", 10),
  };

  const classes = await ClassModel.insertMany([
    { standardName: "6th Standard", batchName: "Morning Batch" },
    { standardName: "10th Standard", batchName: "Evening Batch" },
  ]);

  const sixth = classes[0];
  const tenth = classes[1];

  const users = await User.insertMany([
    {
      name: "Admin User",
      email: "admin@erp.com",
      password: passwords.admin,
      role: "admin",
      phone: "9999999991",
    },
    {
      name: "Teacher User",
      email: "teacher@erp.com",
      password: passwords.teacher,
      role: "teacher",
      phone: "9999999992",
    },
    {
      name: "Student User",
      email: "student@erp.com",
      password: passwords.student,
      role: "student",
      phone: "9999999993",
      classId: sixth._id,
    },
    {
      name: "Riya Patel",
      email: "riya@erp.com",
      password: passwords.student,
      role: "student",
      phone: "9999999994",
      classId: tenth._id,
    },
  ]);

  const subjects = await Subject.insertMany([
    { classId: sixth._id, subjectName: "Mathematics" },
    { classId: sixth._id, subjectName: "Science" },
    { classId: sixth._id, subjectName: "English" },
    { classId: tenth._id, subjectName: "Mathematics" },
    { classId: tenth._id, subjectName: "Science" },
    { classId: tenth._id, subjectName: "English" },
  ]);

  const studentUser = users.find((u) => u.email === "student@erp.com");
  const math6 = subjects.find((s) => s.classId.toString() === sixth._id.toString() && s.subjectName === "Mathematics");
  const sci6 = subjects.find((s) => s.classId.toString() === sixth._id.toString() && s.subjectName === "Science");
  const eng6 = subjects.find((s) => s.classId.toString() === sixth._id.toString() && s.subjectName === "English");

  await Attendance.insertMany([
    { classId: sixth._id, studentId: studentUser._id, date: new Date("2026-04-01"), status: "present" },
    { classId: sixth._id, studentId: studentUser._id, date: new Date("2026-04-02"), status: "present" },
    { classId: sixth._id, studentId: studentUser._id, date: new Date("2026-04-03"), status: "absent" },
    { classId: sixth._id, studentId: studentUser._id, date: new Date("2026-04-04"), status: "present" },
  ]);

  await Mark.insertMany([
    { classId: sixth._id, studentId: studentUser._id, subjectId: math6._id, testType: "Weekly Test", maxMarks: 100, obtainedMarks: 82, examDate: new Date("2026-04-05") },
    { classId: sixth._id, studentId: studentUser._id, subjectId: sci6._id, testType: "Weekly Test", maxMarks: 100, obtainedMarks: 76, examDate: new Date("2026-04-05") },
    { classId: sixth._id, studentId: studentUser._id, subjectId: eng6._id, testType: "Weekly Test", maxMarks: 100, obtainedMarks: 88, examDate: new Date("2026-04-05") },
  ]);

  await Fee.insertMany([
    { studentId: studentUser._id, classId: sixth._id, totalAmount: 12000, paidAmount: 8000, pendingAmount: 4000, dueDate: new Date("2026-05-01"), status: "partial" },
  ]);

  await Remark.insertMany([
    { studentId: studentUser._id, classId: sixth._id, text: "Good improvement in Mathematics. Needs more focus in Science." },
  ]);

  console.log("Database seeded successfully");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});